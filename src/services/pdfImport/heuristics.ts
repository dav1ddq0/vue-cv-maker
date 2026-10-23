import type { ExtractedDocument, ExtractedLine } from './extract'
import {
  BULLET_RE,
  DATE_RANGE_RE,
  EMAIL_RE,
  MONTH_INDEX,
  normalizeHeading,
  PHONE_RE,
  PRESENT_WORDS,
  PROFILE_HOSTS,
  SECTION_KEYWORDS,
  URL_RE,
  type SectionKind,
} from './patterns'

export type Confidence = 'high' | 'medium' | 'low'

export interface DetectedField<T> {
  value: T
  confidence: Confidence
}

export interface TextBlock {
  id: string
  lines: string[]
  /** Heading the block sat under, when the heading itself was not recognized. */
  heading?: string
}

export interface DetectedSection {
  kind: SectionKind
  heading: string
  lines: ExtractedLine[]
}

export interface ImportDraft {
  fullName: DetectedField<string>
  headline: DetectedField<string>
  email: DetectedField<string>
  phone: DetectedField<string>
  location: DetectedField<string>
  links: Array<{ label: string; url: string }>
  sections: DetectedSection[]
  unclassified: TextBlock[]
  rawText: string
  warnings: Array<'multiColumn' | 'noSections' | 'noName'>
}

/**
 * Stage 2 of the import pipeline (spec §7.2). Pure and synchronous: it takes the
 * extraction output and produces a *proposal*, never a `CVData`. Nothing here
 * reaches the store — the review screen (stage 3) decides what is applied.
 */
export function analyze(doc: ExtractedDocument): ImportDraft {
  const { lines } = doc
  // The name is found first: it is typically the largest, boldest, shortest line
  // on the page, which is exactly the shape of a section header. Excluding it up
  // front stops it from being read as one.
  const nameIndex = findNameIndex(lines)
  const headings = findHeadings(lines, nameIndex)
  const sections = sliceSections(lines, headings)
  const headerLines = lines.slice(0, headings[0]?.index ?? Math.min(lines.length, 12))

  const email = findFirst(lines, EMAIL_RE)
  const phone = findPhone(lines)
  const links = findLinks(lines)
  const name = describeName(lines, nameIndex, headerLines)
  const headline = findHeadline(headerLines, name.value)
  const location = findLocation(headerLines, email.value, phone.value)

  const warnings: ImportDraft['warnings'] = []
  if (doc.looksMultiColumn) warnings.push('multiColumn')
  if (sections.length === 0) warnings.push('noSections')
  if (!name.value) warnings.push('noName')

  return {
    fullName: name,
    headline,
    email,
    phone,
    location,
    links,
    sections,
    unclassified: buildUnclassified(lines, headings, headerLines, {
      email: email.value,
      phone: phone.value,
      name: name.value,
      headline: headline.value,
      location: location.value,
      links,
    }),
    rawText: doc.rawText,
    warnings,
  }
}

/* ---- headings ---------------------------------------------------------- */

interface HeadingHit {
  index: number
  kind: SectionKind | null
  text: string
}

/**
 * A section header is rarely identifiable by one signal alone, so four are
 * combined: a known keyword, above-average font size, bold weight, and being a
 * short isolated line. A keyword match alone is enough; otherwise two of the
 * remaining signals plus an ALL-CAPS or short-line shape are required.
 */
function findHeadings(lines: ExtractedLine[], skipIndex: number): HeadingHit[] {
  if (!lines.length) return []
  const sizes = lines.map((l) => l.fontSize).filter(Boolean)
  const averageSize = sizes.reduce((a, b) => a + b, 0) / (sizes.length || 1)

  const hits: HeadingHit[] = []
  lines.forEach((line, index) => {
    if (index === skipIndex) return
    const normalized = normalizeHeading(line.text)
    if (!normalized || normalized.length > 40) return

    const keyword = SECTION_KEYWORDS.find((entry) => entry.words.includes(normalized))
    const larger = line.fontSize > averageSize * 1.08
    const isShort = line.text.trim().split(/\s+/).length <= 4
    const upper = line.text === line.text.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(line.text)

    if (keyword) {
      hits.push({ index, kind: keyword.kind, text: line.text.trim() })
      return
    }
    // An unrecognized but clearly styled heading still splits the document; its
    // content lands in the unclassified panel for the user to place.
    const signals = [larger, line.bold, upper].filter(Boolean).length
    if (isShort && signals >= 2) hits.push({ index, kind: null, text: line.text.trim() })
  })

  return hits
}

function sliceSections(lines: ExtractedLine[], headings: HeadingHit[]): DetectedSection[] {
  const sections: DetectedSection[] = []
  headings.forEach((heading, i) => {
    if (!heading.kind) return
    const end = headings[i + 1]?.index ?? lines.length
    const body = lines.slice(heading.index + 1, end)
    if (body.length) sections.push({ kind: heading.kind, heading: heading.text, lines: body })
  })
  return sections
}

/* ---- direct fields ----------------------------------------------------- */

function findFirst(lines: ExtractedLine[], pattern: RegExp): DetectedField<string> {
  for (const line of lines) {
    const match = line.text.match(pattern)
    if (match) return { value: match[0].trim(), confidence: 'high' }
  }
  return { value: '', confidence: 'low' }
}

function findPhone(lines: ExtractedLine[]): DetectedField<string> {
  for (const line of lines) {
    // Skip lines that are really a date range — they match the phone shape too.
    if (DATE_RANGE_RE.test(line.text)) continue
    const match = line.text.match(PHONE_RE)
    if (!match) continue
    const digits = match[0].replace(/\D/g, '')
    if (digits.length < 8 || digits.length > 15) continue
    return { value: match[0].trim(), confidence: match[0].includes('+') ? 'high' : 'medium' }
  }
  return { value: '', confidence: 'low' }
}

function findLinks(lines: ExtractedLine[]): Array<{ label: string; url: string }> {
  const seen = new Set<string>()
  const links: Array<{ label: string; url: string }> = []

  for (const line of lines) {
    for (const match of line.text.matchAll(URL_RE)) {
      const url = match[0].replace(/[.,;)]$/, '')
      if (EMAIL_RE.test(url) || !url.includes('.')) continue
      const key = url.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      const profile = PROFILE_HOSTS.find((p) => p.host.test(url))
      links.push({ label: profile?.label ?? 'Web', url })
    }
  }
  return links.slice(0, 6)
}

/** Candidate name lines: page 1, two to five words, no contact details. */
function nameCandidates(lines: ExtractedLine[]): number[] {
  return lines
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => line.page === 1)
    .filter(({ line }) => !EMAIL_RE.test(line.text) && !new RegExp(URL_RE.source, 'i').test(line.text))
    .filter(({ line }) => {
      const words = line.text.trim().split(/\s+/)
      return words.length >= 2 && words.length <= 5 && line.text.length <= 60
    })
    .map(({ index }) => index)
}

/** The name is usually the largest text on page 1 (spec §7.2). */
function findNameIndex(lines: ExtractedLine[]): number {
  const candidates = nameCandidates(lines)
  if (!candidates.length) return -1
  return candidates.reduce((best, index) =>
    lines[index].fontSize > lines[best].fontSize ? index : best,
  )
}

function describeName(
  lines: ExtractedLine[],
  index: number,
  headerLines: ExtractedLine[],
): DetectedField<string> {
  if (index < 0) return { value: '', confidence: 'low' }
  const chosen = lines[index]
  const others = nameCandidates(lines).filter((i) => i !== index)
  const runnerUp = others.length ? Math.max(...others.map((i) => lines[i].fontSize)) : 0

  // A name set clearly larger than everything else is a confident match; a tie
  // means the layout gives us nothing to go on.
  const clear = chosen.fontSize > runnerUp * 1.15
  const early = index === 0 || headerLines.includes(chosen)
  return {
    value: titleCaseIfShouting(chosen.text.trim()),
    confidence: clear && early ? 'high' : clear || early ? 'medium' : 'low',
  }
}

function findHeadline(headerLines: ExtractedLine[], name: string): DetectedField<string> {
  const index = headerLines.findIndex((l) => l.text.trim() === name || titleCaseIfShouting(l.text.trim()) === name)
  const next = headerLines[index + 1]
  if (!next) return { value: '', confidence: 'low' }
  const text = next.text.trim()
  if (!text || EMAIL_RE.test(text) || PHONE_RE.test(text) || text.length > 80) {
    return { value: '', confidence: 'low' }
  }
  return { value: text, confidence: 'medium' }
}

const LOCATION_RE = /^[\p{L}\s.'-]+(?:,\s*[\p{L}\s.'-]+)+$/u

function findLocation(headerLines: ExtractedLine[], email: string, phone: string): DetectedField<string> {
  for (const line of headerLines) {
    const text = line.text.trim()
    if (!text || text === email || text === phone) continue
    if (text.length > 48 || text.split(/\s+/).length > 6) continue
    if (LOCATION_RE.test(text)) return { value: text, confidence: 'medium' }
  }
  return { value: '', confidence: 'low' }
}

/* ---- unclassified ------------------------------------------------------ */

function buildUnclassified(
  lines: ExtractedLine[],
  headings: HeadingHit[],
  headerLines: ExtractedLine[],
  used: {
    email: string
    phone: string
    name: string
    headline: string
    location: string
    links: Array<{ url: string }>
  },
): TextBlock[] {
  const blocks: TextBlock[] = []

  // Header lines that did not become a recognized field.
  const leftovers = headerLines
    .map((l) => l.text.trim())
    .filter((text) => {
      if (!text) return false
      if ([used.email, used.phone, used.headline, used.location].includes(text)) return false
      if (titleCaseIfShouting(text) === used.name) return false
      if (used.links.some((link) => text.includes(link.url))) return false
      return !EMAIL_RE.test(text) && !PHONE_RE.test(text)
    })
  if (leftovers.length) blocks.push({ id: 'block_header', lines: leftovers })

  // Content under headings we could not map to a known section.
  headings.forEach((heading, i) => {
    if (heading.kind) return
    const end = headings[i + 1]?.index ?? lines.length
    const body = lines.slice(heading.index + 1, end).map((l) => l.text.trim()).filter(Boolean)
    if (body.length) blocks.push({ id: `block_${heading.index}`, lines: body, heading: heading.text })
  })

  return blocks
}

/* ---- parsing helpers used by the draft -> CVData step ------------------ */

export interface ParsedRange {
  start: string
  end: string | null
}

/** Turns "Mar 2021 – actualidad" into partial ISO dates the model stores. */
export function parseDateRange(text: string): ParsedRange | null {
  const match = text.match(DATE_RANGE_RE)
  if (!match) return null
  const start = toPartialIso(match[1])
  if (!start) return null
  const endRaw = match[2]
  const end = PRESENT_WORDS.test(endRaw) ? null : toPartialIso(endRaw)
  return { start, end: end ?? null }
}

export function toPartialIso(token: string): string {
  const year = token.match(/\d{4}/)?.[0]
  if (!year) return ''
  const monthWord = token
    .toLowerCase()
    .match(/[a-záéíóú]{3,}/)?.[0]
    ?.slice(0, 4)
  const numericMonth = token.match(/\b(\d{1,2})[/-]\d{4}/)?.[1]

  const month =
    numericMonth ??
    (monthWord
      ? String(MONTH_INDEX[monthWord] ?? MONTH_INDEX[monthWord.slice(0, 3)] ?? '')
      : '')

  return month ? `${year}-${String(month).padStart(2, '0')}` : year
}

export function isBullet(text: string): boolean {
  return BULLET_RE.test(text)
}

export function stripBullet(text: string): string {
  return text.replace(BULLET_RE, '').trim()
}

/** "NADIA MARTÍN" reads badly in a CV header; "Nadia Martín" does. */
export function titleCaseIfShouting(value: string): string {
  if (value !== value.toUpperCase()) return value
  return value
    .toLowerCase()
    .split(/(\s+)/)
    .map((part) => (part.trim() ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join('')
}
