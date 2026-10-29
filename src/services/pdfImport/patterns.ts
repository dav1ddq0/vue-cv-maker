/** Regexes and keyword tables shared by the import heuristics. Kept separate so
 *  adding a language is a data change, not a logic change. */

export const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]{2,}/
export const URL_RE = /\b(?:https?:\/\/)?(?:[\w-]+\.)+[a-z]{2,}(?:\/[\w#!:.?+=&%@\-/]*)?/gi
/** Deliberately loose: international CV phone formatting is wildly inconsistent. */
export const PHONE_RE = /(?:\+\d{1,3}[\s.-]?)?(?:\(\d{1,4}\)[\s.-]?)?\d[\d\s.-]{7,14}\d/

export const PROFILE_HOSTS: Array<{ host: RegExp; label: string }> = [
  { host: /linkedin\.com/i, label: 'LinkedIn' },
  { host: /github\.com/i, label: 'GitHub' },
  { host: /gitlab\.com/i, label: 'GitLab' },
  { host: /stackoverflow\.com/i, label: 'Stack Overflow' },
  { host: /behance\.net/i, label: 'Behance' },
  { host: /dribbble\.com/i, label: 'Dribbble' },
]

const MONTHS_ES = 'ene|feb|mar|abr|may|jun|jul|ago|sep|set|oct|nov|dic'
const MONTHS_EN = 'jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec'
export const PRESENT_WORDS = /actualidad|actualmente|presente|present|current|now|hoy/i

const MONTH_TOKEN = `(?:${MONTHS_ES}|${MONTHS_EN})[a-z]*\\.?`
const DATE_TOKEN = `(?:${MONTH_TOKEN}\\s*,?\\s*)?(?:\\d{1,2}[/-])?\\d{4}`

/** "2020 - 2023", "Mar 2021 – actualidad", "03/2019 a 06/2021". */
export const DATE_RANGE_RE = new RegExp(
  `(${DATE_TOKEN})\\s*(?:[-–—]|a|to|hasta|until)\\s*(${DATE_TOKEN}|${PRESENT_WORDS.source})`,
  'i',
)

export const MONTH_INDEX: Record<string, number> = {
  ene: 1, jan: 1,
  feb: 2,
  mar: 3,
  abr: 4, apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  ago: 8, aug: 8,
  sep: 9, set: 9, sept: 9,
  oct: 10,
  nov: 11,
  dic: 12, dec: 12,
}

export type SectionKind = 'summary' | 'experience' | 'education' | 'skills' | 'languages'

/** Multi-language section headers (spec §7.2). Matched on a normalized, accent-free string. */
export const SECTION_KEYWORDS: Array<{ kind: SectionKind; words: string[] }> = [
  {
    kind: 'summary',
    words: ['resumen', 'perfil', 'sobre mi', 'acerca de mi', 'extracto', 'summary', 'profile', 'about me', 'objective'],
  },
  {
    kind: 'experience',
    words: [
      'experiencia', 'experiencia laboral', 'experiencia profesional', 'trayectoria',
      'empleo', 'historial laboral', 'experience', 'work experience',
      'professional experience', 'employment', 'career',
    ],
  },
  {
    kind: 'education',
    words: [
      'formacion', 'formacion academica', 'educacion', 'estudios', 'titulacion',
      'education', 'academic background', 'qualifications', 'academic',
    ],
  },
  {
    kind: 'skills',
    words: [
      'habilidades', 'competencias', 'aptitudes', 'conocimientos', 'tecnologias',
      'skills', 'technical skills', 'core competencies', 'expertise', 'technologies', 'stack',
    ],
  },
  {
    kind: 'languages',
    words: ['idiomas', 'lenguas', 'languages', 'language skills'],
  },
]

export const BULLET_RE = /^[•‣▪●·*\-–—]\s+/

/**
 * The keyword a heading names once its letters are run together. A tracked-out heading ("RE SUMEN",
 * "EXPE RI ENCIA") reaches the extraction in pieces that no word-gap rule can tell from word spaces.
 */
export function sectionKindOfSquashed(value: string): SectionKind | null {
  const squashed = normalizeHeading(value).replace(/ /g, '')
  return SECTION_KEYWORDS.find((entry) => entry.words.some((word) => word.replace(/ /g, '') === squashed))?.kind ?? null
}

/** Whether `value` names one of the known sections, however its letters are spaced (spec 040). */
export function isSectionHeading(value: string): boolean {
  const normalized = normalizeHeading(value)
  return SECTION_KEYWORDS.some((entry) => entry.words.includes(normalized)) || sectionKindOfSquashed(value) !== null
}

/** Lowercase, accent-free, punctuation-free — the form section headers are matched in. */
export function normalizeHeading(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
