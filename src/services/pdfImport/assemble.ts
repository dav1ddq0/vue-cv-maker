import type { CVData } from '@/types/cv'
import {
  createCustomSection,
  createEducation,
  createEmptyCV,
  createExperience,
  createLanguage,
  createLink,
  createSkillGroup,
} from '@/core/factory'
import { reconcileOrder } from '@/core/migrations'
import type { ExtractedLine } from './extract'
import type { DetectedSection, ImportDraft } from './heuristics'
import { isBullet, parseDateRange, stripBullet } from './heuristics'
import { DATE_RANGE_RE, type SectionKind } from './patterns'

/** Where the user sent each unclassified block on the review screen. */
export type BlockTarget = SectionKind | 'summary' | 'discard' | 'custom'

export interface ReviewDecisions {
  /** Field overrides typed by the user, applied on top of the detected values. */
  personal?: Partial<CVData['personal']>
  headline?: string
  /** blockId -> target section. Anything absent defaults to `discard`. */
  blocks?: Record<string, BlockTarget>
  language?: string
}

/**
 * Stage 3's output: the reviewed draft becomes a real `CVData`.
 *
 * Kept separate from `analyze` so the review screen can re-run it on every
 * change without re-parsing the PDF, and so it is trivially unit-testable.
 */
export function assembleCV(draft: ImportDraft, decisions: ReviewDecisions = {}): CVData {
  const cv = createEmptyCV()
  cv.meta.language = decisions.language ?? 'es'
  cv.meta.title = draft.fullName.value || cv.meta.title

  cv.personal = {
    ...cv.personal,
    fullName: draft.fullName.value,
    headline: decisions.headline ?? draft.headline.value,
    email: draft.email.value,
    phone: draft.phone.value,
    location: draft.location.value,
    links: draft.links.map((link) => ({ ...createLink(), ...link })),
    ...decisions.personal,
  }

  for (const section of draft.sections) {
    switch (section.kind) {
      case 'summary':
        cv.summary = joinLines(section).trim()
        break
      case 'experience':
        cv.experience.push(...parseExperience(section))
        break
      case 'education':
        cv.education.push(...parseEducation(section))
        break
      case 'skills':
        cv.skills.push(...parseSkills(section))
        break
      case 'languages':
        cv.languages.push(...parseLanguages(section))
        break
    }
  }

  applyBlocks(cv, draft, decisions.blocks ?? {})
  cv.sectionOrder = reconcileOrder(cv.sectionOrder, cv)
  return cv
}

/* ---- section parsers --------------------------------------------------- */

/**
 * An entry starts wherever a date range appears: in practice that is the single
 * most reliable boundary marker across CV layouts. Lines before the first date
 * are treated as the first entry's title.
 */
function parseExperience(section: DetectedSection) {
  return splitByDate(section.lines).map((chunk) => {
    const entry = createExperience()
    const range = chunk.dateText ? parseDateRange(chunk.dateText) : null
    if (range) {
      entry.startDate = range.start
      entry.endDate = range.end
    }

    const [position, company] = splitTitleLine(chunk.title)
    entry.position = position
    entry.company = company

    for (const line of chunk.body) {
      if (isBullet(line)) entry.highlights.push(stripBullet(line))
      else entry.description = entry.description ? `${entry.description} ${line}` : line
    }
    return entry
  })
}

function parseEducation(section: DetectedSection) {
  return splitByDate(section.lines).map((chunk) => {
    const entry = createEducation()
    const range = chunk.dateText ? parseDateRange(chunk.dateText) : null
    if (range) {
      entry.startDate = range.start
      entry.endDate = range.end
    }
    const [degree, institution] = splitTitleLine(chunk.title)
    entry.degree = degree
    entry.institution = institution
    entry.description = chunk.body.map(stripBullet).join(' ').trim() || undefined
    return entry
  })
}

/** "Lenguajes: TypeScript, Go" becomes a group; a bare list becomes one unnamed group. */
function parseSkills(section: DetectedSection) {
  const groups = []
  const loose: string[] = []

  for (const line of section.lines) {
    const text = stripBullet(line.text)
    const match = text.match(/^([^:]{2,40}):\s*(.+)$/)
    if (match) {
      const group = createSkillGroup()
      group.category = match[1].trim()
      group.items = splitItems(match[2])
      groups.push(group)
    } else if (text) {
      loose.push(...splitItems(text))
    }
  }

  if (loose.length) {
    const group = createSkillGroup()
    group.items = loose
    groups.push(group)
  }
  return groups
}

/** "Inglés — C1", "Español (nativo)", "French: B2". */
function parseLanguages(section: DetectedSection) {
  return section.lines
    .map((line) => stripBullet(line.text))
    .filter(Boolean)
    .map((text) => {
      const entry = createLanguage()
      const match = text.match(/^(.+?)\s*(?:[:–—-]|\()\s*([^)]+)\)?$/)
      if (match) {
        entry.name = match[1].trim()
        entry.level = match[2].trim()
      } else {
        entry.name = text
      }
      return entry
    })
}

/* ---- reviewed blocks --------------------------------------------------- */

function applyBlocks(cv: CVData, draft: ImportDraft, targets: Record<string, BlockTarget>) {
  for (const block of draft.unclassified) {
    const target = targets[block.id] ?? 'discard'
    if (target === 'discard') continue

    const asSection: DetectedSection = {
      kind: target === 'custom' ? 'summary' : target,
      heading: block.heading ?? '',
      lines: block.lines.map(toLine),
    }

    switch (target) {
      case 'summary':
        cv.summary = [cv.summary, block.lines.join(' ')].filter(Boolean).join(' ').trim()
        break
      case 'experience':
        cv.experience.push(...parseExperience(asSection))
        break
      case 'education':
        cv.education.push(...parseEducation(asSection))
        break
      case 'skills':
        cv.skills.push(...parseSkills(asSection))
        break
      case 'languages':
        cv.languages.push(...parseLanguages(asSection))
        break
      case 'custom': {
        const section = createCustomSection(block.heading || 'Otros')
        section.entries = block.lines.map((text) => ({
          id: `${block.id}_${section.entries.length}_${text.length}`,
          title: stripBullet(text),
        }))
        cv.customSections.push(section)
        break
      }
    }
  }
}

/* ---- shared helpers ---------------------------------------------------- */

interface Chunk {
  title: string
  dateText: string
  body: string[]
}

/**
 * Splits a section into entries at each line carrying a date range: in practice
 * that is the most reliable boundary marker across CV layouts. Text left on the
 * date line becomes the entry title; a date on its own line attaches to the
 * entry above it.
 */
function splitByDate(lines: ExtractedLine[]): Chunk[] {
  const chunks: Chunk[] = []
  let current: Chunk | null = null

  for (const line of lines) {
    const text = line.text.trim()
    if (!text) continue

    if (!hasDateRange(text)) {
      if (!current) {
        current = { title: text, dateText: '', body: [] }
        chunks.push(current)
      } else if (!current.title) {
        current.title = text
      } else {
        current.body.push(text)
      }
      continue
    }

    const remainder = stripDatePortion(text)
    // A bare date right under a title belongs to that entry, not a new one.
    if (current && !current.dateText && !remainder) {
      current.dateText = text
      continue
    }
    current = { title: remainder, dateText: text, body: [] }
    chunks.push(current)
  }

  return chunks.filter((chunk) => chunk.title || chunk.body.length)
}

function hasDateRange(text: string): boolean {
  return parseDateRange(text) !== null
}

/** The line with its date range removed — usually the position or degree. */
function stripDatePortion(text: string): string {
  const match = text.match(DATE_RANGE_RE)
  if (!match) return text.trim()
  return text
    .replace(match[0], ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s|·–—-]+|[\s|·–—(-]+$/g, '')
    .trim()
}

/** "Backend Engineer — Acme" / "Backend Engineer at Acme" / "Backend Engineer, Acme". */
function splitTitleLine(text: string): [string, string] {
  const separators = /\s(?:[–—|·]|-{1,2}|en|at)\s/i
  const parts = text.split(separators)
  if (parts.length >= 2) return [parts[0].trim(), parts.slice(1).join(' ').trim()]
  const comma = text.split(/,\s*/)
  if (comma.length === 2) return [comma[0].trim(), comma[1].trim()]
  return [text.trim(), '']
}

function splitItems(text: string): string[] {
  return text
    .split(/[,;·•|]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function joinLines(section: DetectedSection): string {
  return section.lines.map((l) => l.text.trim()).filter(Boolean).join(' ')
}

/** Blocks carry plain strings; the parsers want `ExtractedLine`s. */
function toLine(text: string): ExtractedLine {
  return { page: 1, y: 0, x: 0, text, fontSize: 0, fontName: '', bold: false }
}
