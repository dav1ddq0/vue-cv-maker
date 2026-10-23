import type { CustomSection } from '@/types/cv'
import { createCustomEntry, createCustomSection } from './factory'

export const SECTION_PRESET_IDS = [
  'courses',
  'certificates',
  'internships',
  'projects',
  'hobbies',
  'references',
  'privacy',
] as const

export type SectionPresetId = (typeof SECTION_PRESET_IDS)[number]

interface SectionPreset {
  /** Section title as it appears in the CV, per content language. */
  titles: Record<string, string>
  /** Optional first entry, for sections that make no sense empty. */
  seed?: Record<string, string>
}

const PRESETS: Record<SectionPresetId, SectionPreset> = {
  courses: { titles: { es: 'Cursos', en: 'Courses' } },
  certificates: { titles: { es: 'Certificados', en: 'Certificates' } },
  internships: { titles: { es: 'Prácticas', en: 'Internships' } },
  projects: { titles: { es: 'Proyectos', en: 'Projects' } },
  hobbies: { titles: { es: 'Intereses', en: 'Interests' } },
  references: {
    titles: { es: 'Referencias', en: 'References' },
    seed: { es: 'Disponibles bajo petición', en: 'Available on request' },
  },
  privacy: {
    titles: { es: 'Protección de datos', en: 'Data protection' },
    seed: {
      es: 'Doy mi consentimiento para el tratamiento de mis datos personales con fines de selección de personal.',
      en: 'I consent to the processing of my personal data for recruitment purposes.',
    },
  },
}

const FALLBACK = 'es'

/** Title a preset gets for a CV content language (falls back to Spanish). */
export function presetTitle(id: SectionPresetId, language: string): string {
  const { titles } = PRESETS[id]
  return titles[language] ?? titles[FALLBACK]!
}

export function createSectionFromPreset(id: SectionPresetId, language: string): CustomSection {
  const section = createCustomSection(presetTitle(id, language))
  const seed = PRESETS[id].seed
  if (seed) section.entries.push({ ...createCustomEntry(), title: seed[language] ?? seed[FALLBACK]! })
  return section
}
