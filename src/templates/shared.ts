import type { CVData, SkillGroup, StyleTokens } from '@/types/cv'

/**
 * Helpers shared by every template. They are *pure functions* on purpose:
 * templates may import from here, but must never reach into a Pinia store
 * (spec §4 — a template takes exactly one prop and holds no state).
 */

const MONTHS: Record<string, string[]> = {
  es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}

const PRESENT: Record<string, string> = { es: 'Actualidad', en: 'Present' }

/** Renders a partial ISO date ("2023-04" / "2023") in the CV's content language. */
export function formatPartialDate(value: string, language = 'es'): string {
  if (!value) return ''
  const [year, month] = value.split('-')
  if (!month) return year ?? value
  const months = MONTHS[language] ?? MONTHS.es
  const index = Number(month) - 1
  const name = months[index]
  return name ? `${name} ${year}` : value
}

export function formatDateRange(start: string, end: string | null, language = 'es'): string {
  const from = formatPartialDate(start, language)
  const to = end === null ? (PRESENT[language] ?? PRESENT.es) : formatPartialDate(end, language)
  if (!from && !to) return ''
  if (!from) return to
  if (!to) return from
  return `${from} – ${to}`
}

/**
 * `StyleTokens` reach templates only as CSS custom properties, so a template can
 * never hardcode a color or a font and still look right (spec §4).
 */
const WHITE = '#ffffff'
const INK = '#1a1a1a'

function luminance(hex: string): number | null {
  const match = hex.trim().match(/^#([0-9a-f]{6})$/i)
  if (!match) return null
  const value = parseInt(match[1]!, 16)
  const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!
}

/** WCAG contrast ratio between two `#rrggbb` colours, or `null` when either is not one. */
export function contrastRatio(a: string, b: string): number | null {
  const la = luminance(a)
  const lb = luminance(b)
  if (la === null || lb === null) return null
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

/** Text colour to print on an accent-filled area: white or near-black, whichever reads better. */
export function onAccent(accent: string): string {
  const white = contrastRatio(accent, WHITE)
  const ink = contrastRatio(accent, INK)
  if (white === null || ink === null) return WHITE
  return ink > white ? INK : WHITE
}

const MIN_TEXT_CONTRAST = 4.5

/**
 * The accent to use for *text* on a light surface: unchanged when it already reaches
 * 4.5:1 against white, otherwise the same hue mixed with black until it does.
 * Fills, borders and shapes should keep using the accent itself.
 */
export function accentText(accent: string): string {
  const match = accent.trim().match(/^#([0-9a-f]{6})$/i)
  if (!match) return accent
  const base = parseInt(match[1]!, 16)
  const rgb = [(base >> 16) & 255, (base >> 8) & 255, base & 255]
  for (let step = 0; step <= 20; step += 1) {
    const keep = 1 - step * 0.05
    const hex =
      '#' +
      rgb
        .map((c) => Math.round(c * keep).toString(16).padStart(2, '0'))
        .join('')
    if ((contrastRatio(hex, WHITE) ?? 0) >= MIN_TEXT_CONTRAST) return hex
  }
  return '#000000'
}

export function styleVars(style: StyleTokens): Record<string, string> {
  return {
    '--cv-accent': style.accentColor,
    '--cv-on-accent': onAccent(style.accentColor),
    '--cv-accent-text': accentText(style.accentColor),
    '--cv-font': style.fontFamily,
    '--cv-font-scale': String(style.fontScale),
    '--cv-spacing-scale': String(style.spacingScale),
    '--cv-page-margin': style.pageMargin,
  }
}

export interface ResolvedSection {
  id: string
  kind: 'summary' | 'experience' | 'education' | 'skills' | 'languages' | 'custom'
  title: string
  custom?: CVData['customSections'][number]
}

const BUILTIN_TITLES: Record<string, Record<string, string>> = {
  summary: { es: 'Resumen', en: 'Summary' },
  experience: { es: 'Experiencia', en: 'Experience' },
  education: { es: 'Formación', en: 'Education' },
  skills: { es: 'Competencias', en: 'Skills' },
  languages: { es: 'Idiomas', en: 'Languages' },
}

/**
 * Turns `sectionOrder` into a render list, skipping sections with no content so
 * an untouched wizard step never leaves an empty heading on the page.
 */
export function resolveSections(data: CVData): ResolvedSection[] {
  const language = data.meta.language || 'es'
  const title = (id: string) => BUILTIN_TITLES[id]?.[language] ?? BUILTIN_TITLES[id]?.es ?? id

  return data.sectionOrder
    .map<ResolvedSection | null>((id) => {
      switch (id) {
        case 'summary':
          return data.summary.trim() ? { id, kind: 'summary', title: title(id) } : null
        case 'experience':
          return data.experience.length ? { id, kind: 'experience', title: title(id) } : null
        case 'education':
          return data.education.length ? { id, kind: 'education', title: title(id) } : null
        case 'skills':
          return data.skills.length ? { id, kind: 'skills', title: title(id) } : null
        case 'languages':
          return data.languages.length ? { id, kind: 'languages', title: title(id) } : null
        default: {
          const custom = data.customSections.find((s) => s.id === id)
          return custom?.entries.length
            ? { id, kind: 'custom', title: custom.title, custom }
            : null
        }
      }
    })
    .filter((s): s is ResolvedSection => s !== null)
}

/** Strips the protocol so links read as "github.com/nadia" rather than the full URL. */
export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

export function absoluteUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

/**
 * Language levels are free text in the model (`LanguageEntry.level`), so the
 * dots shown by a template are *derived* from it. Matching is deliberately
 * conservative: an unknown string yields `null` and the template prints the text
 * alone rather than guess a level. Both languages are always recognised, because
 * what the user typed does not depend on the editor's UI language.
 */
const LEVEL_SCORES: Record<string, number> = {
  nativo: 5, native: 5, materna: 5, 'lengua materna': 5, 'mother tongue': 5,
  bilingue: 5, bilingual: 5,
  avanzado: 4, advanced: 4, fluido: 4, fluent: 4, 'intermedio alto': 4, 'upper intermediate': 4,
  intermedio: 3, intermediate: 3, competente: 3, competent: 3, conversacional: 3, conversational: 3,
  basico: 2, basic: 2, elemental: 1, elementary: 1, principiante: 1, beginner: 1, nociones: 1,
}

const CEFR_SCORES: Record<string, number> = { a1: 1, a2: 2, b1: 3, b2: 4, c1: 5, c2: 5 }

function normalizeLevel(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

/** 1–5, or `null` when the text is not a level this helper recognises. */
export function languageLevelScore(level: string): number | null {
  const text = normalizeLevel(level)
  if (!text) return null
  if (text in LEVEL_SCORES) return LEVEL_SCORES[text] ?? null
  const cefr = text.match(/\b([abc][12])\b/)?.[1]
  return cefr ? (CEFR_SCORES[cefr] ?? null) : null
}

const LEVEL_LABELS: Record<string, (score: number) => string> = {
  es: (score) => `Nivel ${score} de 5`,
  en: (score) => `Level ${score} of 5`,
}

/** Text read by assistive technology; follows the CV content language, not the UI's. */
export function levelAccessibleLabel(score: number, language = 'es'): string {
  return (LEVEL_LABELS[language] ?? LEVEL_LABELS.es!)(score)
}

/** The skill names of a group, in order, without their levels. */
export function skillNames(group: SkillGroup): string[] {
  return group.items.map((item) => item.name)
}

/** True when at least one skill in the group carries a level (the group then renders as rows). */
export function groupHasLevels(group: SkillGroup): boolean {
  return group.items.some((item) => item.level !== undefined)
}
