import type { CVData, ExperienceEntry } from '@/types/cv'

/**
 * Concrete, deterministic advice over the CV (spec 023). Derived on every render like `stepStatus`,
 * never stored, and advisory: nothing here blocks navigation or export.
 */

export type SuggestionLevel = 'important' | 'tip'
/** The step where a suggestion is fixed; a subset of the wizard's step ids. */
export type SuggestionStep = 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'languages'

export interface Suggestion {
  id: string
  level: SuggestionLevel
  step: SuggestionStep
  /** Values for the message, e.g. `{ entry: 'Senior developer · Cartograf' }`. */
  params: Record<string, string | number>
}

interface Failure {
  /** Overrides the rule id when one rule has variants (summary too short / too long). */
  id?: string
  params?: Record<string, string | number>
}

interface Rule {
  id: string
  level: SuggestionLevel
  step: SuggestionStep
  /** Rules that only make sense once something exists; they neither pass nor fail otherwise. */
  applies?: (data: CVData) => boolean
  /** Empty when the rule passes. */
  check: (data: CVData) => Failure[]
}

/** Same bounds as the summary meter (spec 018). */
export const SUMMARY_MIN = 150
export const SUMMARY_MAX = 450
/** Per-entry rules stop here so a long CV is not buried in near-identical items. */
const PER_ENTRY_CAP = 3

const filled = (value: string | undefined | null) => (value ?? '').trim().length > 0
const failIf = (condition: boolean): Failure[] => (condition ? [{}] : [])
const skillCount = (data: CVData) => data.skills.reduce((total, group) => total + group.items.filter((i) => filled(i.name)).length, 0)

/** "Senior developer · Cartograf"; empty when the entry has neither. */
export const entryName = (entry: ExperienceEntry) =>
  [entry.position, entry.company].map((part) => part.trim()).filter(Boolean).join(' · ')

/**
 * Partial ISO dates ("2023-04", "2023") compared on their common precision, so a job ending in
 * "2023" is not "before" one starting in "2023-04".
 */
export function isBefore(a: string, b: string): boolean {
  const n = Math.min(a.length, b.length)
  return a.slice(0, n) < b.slice(0, n)
}

function perEntry(data: CVData, failing: (entry: ExperienceEntry) => boolean): Failure[] {
  return data.experience
    .filter(failing)
    .slice(0, PER_ENTRY_CAP)
    .map((entry) => ({ params: { entry: entryName(entry) } }))
}

const hasExperience = (data: CVData) => data.experience.length > 0

const RULES: Rule[] = [
  { id: 'name', level: 'important', step: 'personal', check: (d) => failIf(!filled(d.personal.fullName)) },
  {
    id: 'contact',
    level: 'important',
    step: 'personal',
    check: (d) => failIf(!filled(d.personal.email) && !filled(d.personal.phone)),
  },
  { id: 'headline', level: 'tip', step: 'personal', check: (d) => failIf(!filled(d.personal.headline)) },
  {
    id: 'links',
    level: 'tip',
    step: 'personal',
    check: (d) => failIf(!d.personal.links.some((link) => filled(link.url))),
  },
  { id: 'summary', level: 'important', step: 'summary', check: (d) => failIf(!filled(d.summary)) },
  {
    id: 'summaryLength',
    level: 'tip',
    step: 'summary',
    applies: (d) => filled(d.summary),
    check: (d) => {
      const length = d.summary.trim().length
      if (length < SUMMARY_MIN) return [{ id: 'summaryShort', params: { n: length, min: SUMMARY_MIN } }]
      if (length > SUMMARY_MAX) return [{ id: 'summaryLong', params: { n: length, max: SUMMARY_MAX } }]
      return []
    },
  },
  { id: 'experience', level: 'important', step: 'experience', check: (d) => failIf(!hasExperience(d)) },
  {
    id: 'experienceDates',
    level: 'important',
    step: 'experience',
    applies: hasExperience,
    check: (d) =>
      perEntry(d, (e) => !filled(e.startDate) || (filled(e.endDate) && isBefore(e.endDate!, e.startDate))),
  },
  {
    id: 'experienceText',
    level: 'tip',
    step: 'experience',
    applies: hasExperience,
    check: (d) => perEntry(d, (e) => !filled(e.description) && !e.highlights.some(filled)),
  },
  {
    id: 'experienceImpact',
    level: 'tip',
    step: 'experience',
    applies: (d) => d.experience.some((e) => filled(e.description) || e.highlights.some(filled)),
    check: (d) => failIf(!d.experience.some((e) => /\d/.test([e.description, ...e.highlights].join(' ')))),
  },
  {
    id: 'experienceOrder',
    level: 'tip',
    step: 'experience',
    applies: (d) => d.experience.filter((e) => filled(e.startDate)).length > 1,
    check: (d) => {
      const starts = d.experience.map((e) => e.startDate).filter(filled)
      return failIf(starts.some((start, i) => i > 0 && isBefore(starts[i - 1]!, start)))
    },
  },
  { id: 'education', level: 'important', step: 'education', check: (d) => failIf(d.education.length === 0) },
  { id: 'skills', level: 'important', step: 'skills', check: (d) => failIf(skillCount(d) === 0) },
  {
    id: 'skillsFew',
    level: 'tip',
    step: 'skills',
    applies: (d) => skillCount(d) > 0,
    check: (d) => (skillCount(d) <= 3 ? [{ params: { n: skillCount(d) } }] : []),
  },
  { id: 'languages', level: 'tip', step: 'languages', check: (d) => failIf(d.languages.length === 0) },
]

const STEP_ORDER: SuggestionStep[] = ['personal', 'summary', 'experience', 'education', 'skills', 'languages']
const WEIGHT: Record<SuggestionLevel, number> = { important: 2, tip: 1 }

/** Everything worth improving, important first, then in wizard order. */
export function suggest(data: CVData): Suggestion[] {
  const out = RULES.filter((rule) => rule.applies?.(data) ?? true).flatMap((rule) =>
    rule.check(data).map<Suggestion>((failure) => ({
      id: failure.id ?? rule.id,
      level: rule.level,
      step: rule.step,
      params: failure.params ?? {},
    })),
  )
  return out.sort(
    (a, b) => WEIGHT[b.level] - WEIGHT[a.level] || STEP_ORDER.indexOf(a.step) - STEP_ORDER.indexOf(b.step),
  )
}

/**
 * 0–100 over the rules that apply, an important rule weighing twice a tip. A rule with several
 * failing entries still counts once: the score says how much is there, the list says what to fix.
 */
export function cvScore(data: CVData): number {
  const applicable = RULES.filter((rule) => rule.applies?.(data) ?? true)
  const total = applicable.reduce((sum, rule) => sum + WEIGHT[rule.level], 0)
  const passed = applicable.reduce((sum, rule) => sum + (rule.check(data).length ? 0 : WEIGHT[rule.level]), 0)
  return total === 0 ? 0 : Math.round((passed / total) * 100)
}
