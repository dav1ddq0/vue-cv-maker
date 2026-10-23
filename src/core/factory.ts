import { SCHEMA_VERSION, SECTION_IDS } from '@/types/cv'
import type {
  CustomSection,
  CVData,
  EducationEntry,
  ExperienceEntry,
  LanguageEntry,
  LinkEntry,
  SkillGroup,
  StyleTokens,
} from '@/types/cv'
import { uid } from './id'

export const DEFAULT_STYLE: StyleTokens = {
  accentColor: '#2563eb',
  fontFamily: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
  fontScale: 1,
  spacingScale: 1,
  pageMargin: '16mm',
}

export function createEmptyCV(partial: Partial<CVData> = {}): CVData {
  const now = new Date().toISOString()
  return {
    schemaVersion: SCHEMA_VERSION,
    meta: {
      id: uid('cv'),
      title: 'Mi CV',
      createdAt: now,
      updatedAt: now,
      language: 'es',
    },
    personal: {
      fullName: '',
      headline: '',
      email: '',
      phone: '',
      location: '',
      birthDate: '',
      birthPlace: '',
      nationality: '',
      drivingLicense: '',
      maritalStatus: '',
      links: [],
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    languages: [],
    customSections: [],
    sectionOrder: [...SECTION_IDS],
    style: { ...DEFAULT_STYLE },
    ...partial,
  }
}

export function createExperience(): ExperienceEntry {
  return {
    id: uid('exp'),
    position: '',
    company: '',
    location: '',
    startDate: '',
    endDate: null,
    description: '',
    highlights: [],
  }
}

export function createEducation(): EducationEntry {
  return {
    id: uid('edu'),
    degree: '',
    institution: '',
    location: '',
    startDate: '',
    endDate: '', // studies are not ongoing by default; null means "present"
    description: '',
  }
}

export function createSkillGroup(): SkillGroup {
  return { id: uid('skg'), category: '', items: [] }
}

export function createLanguage(): LanguageEntry {
  return { id: uid('lng'), name: '', level: '' }
}

export function createLink(): LinkEntry {
  return { id: uid('lnk'), label: '', url: '' }
}

export function createCustomSection(title = ''): CustomSection {
  return { id: uid('cus'), title, entries: [] }
}

export function createCustomEntry() {
  return { id: uid('cen'), title: '', subtitle: '', date: '', description: '' }
}
