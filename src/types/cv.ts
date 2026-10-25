/**
 * The app's central contract. Everything else depends on this module: the store,
 * the storage adapters, the import heuristics and every template render it.
 *
 * Rule of thumb: if a change here is not additive, it needs a bump of
 * `SCHEMA_VERSION` plus a migration step in `src/core/migrations.ts`.
 */

export const SCHEMA_VERSION = 4

export interface CVData {
  schemaVersion: number
  meta: CVMeta
  personal: PersonalDetails
  summary: string
  experience: ExperienceEntry[]
  education: EducationEntry[]
  skills: SkillGroup[]
  languages: LanguageEntry[]
  customSections: CustomSection[]
  /** Render order of the sections; ids come from `SECTION_IDS` plus custom section ids. */
  sectionOrder: string[]
  style: StyleTokens
}

export interface CVMeta {
  id: string
  /** Internal document name, never rendered inside the CV itself. */
  title: string
  createdAt: string
  updatedAt: string
  /** Language of the CV *content*, independent from the UI language. */
  language: string
  /** Template that renders this CV; an id the registry does not know renders with the default. */
  templateId: string
}

/** Codes, not labels: the CV shows them in its own content language. */
export const MARITAL_STATUSES = ['single', 'married', 'partner', 'divorced', 'widowed'] as const
export type MaritalStatus = (typeof MARITAL_STATUSES)[number]

export interface PersonalDetails {
  fullName: string
  headline: string
  email: string
  phone: string
  location: string
  /**
   * Optional extras, `''` when not given and then not rendered. Sensitive in several markets, so
   * the form keeps them collapsed and never fills them by itself.
   */
  /** Full ISO date `YYYY-MM-DD`. */
  birthDate: string
  birthPlace: string
  nationality: string
  drivingLicense: string
  maritalStatus: MaritalStatus | ''
  /** IndexedDB reference (`photo:{id}`), never the image bytes. See services/storage. */
  photo?: string
  links: LinkEntry[]
}

export interface LinkEntry {
  id: string
  label: string
  url: string
}

export interface ExperienceEntry {
  id: string
  position: string
  company: string
  location?: string
  /** Partial ISO date: "2023-04" or "2023". */
  startDate: string
  /** `null` means "present". */
  endDate: string | null
  description: string
  highlights: string[]
}

export interface EducationEntry {
  id: string
  degree: string
  institution: string
  location?: string
  startDate: string
  endDate: string | null
  description?: string
}

export interface SkillItem {
  name: string
  /** Integer 1–5 when the user rated the skill; absent otherwise. */
  level?: number
}

export interface SkillGroup {
  id: string
  category: string
  items: SkillItem[]
}

export interface LanguageEntry {
  id: string
  name: string
  level: string
}

export interface CustomSectionEntry {
  id: string
  title: string
  subtitle?: string
  date?: string
  description?: string
}

export interface CustomSection {
  id: string
  title: string
  entries: CustomSectionEntry[]
}

export interface StyleTokens {
  accentColor: string
  fontFamily: string
  /** Multiplier, clamped to 0.85–1.15. */
  fontScale: number
  spacingScale: number
  pageMargin: string
}

/** Built-in section ids. Custom sections contribute their own id to `sectionOrder`. */
export const SECTION_IDS = [
  'summary',
  'experience',
  'education',
  'skills',
  'languages',
] as const

export type SectionId = (typeof SECTION_IDS)[number]

export interface CVSummary {
  id: string
  title: string
  fullName: string
  updatedAt: string
  /** Absent on entries indexed before spec 021, until their CV is saved again. */
  templateId?: string
  accentColor?: string
}
