import { describe, expect, it } from 'vitest'
import { CV_LANGUAGES } from '@/core/stylePresets'
import {
  SECTION_PRESET_IDS,
  createSectionFromPreset,
  presetTitle,
} from '@/core/sectionPresets'
import es from '@/i18n/es'
import en from '@/i18n/en'

describe('section presets', () => {
  it('titles every preset in every CV language', () => {
    for (const { code } of CV_LANGUAGES) {
      for (const id of SECTION_PRESET_IDS) expect(presetTitle(id, code).length).toBeGreaterThan(0)
    }
  })

  it('creates a section in the content language, with a fresh id each time', () => {
    const a = createSectionFromPreset('courses', 'en')
    const b = createSectionFromPreset('courses', 'en')
    expect(a.title).toBe('Courses')
    expect(a.entries).toEqual([])
    expect(a.id).not.toBe(b.id)
    expect(createSectionFromPreset('courses', 'es').title).toBe('Cursos')
  })

  it('falls back to Spanish for an unknown language', () => {
    expect(createSectionFromPreset('projects', 'xx').title).toBe('Proyectos')
  })

  it('seeds references and the consent clause only', () => {
    expect(createSectionFromPreset('references', 'es').entries[0]?.title).toBe('Disponibles bajo petición')
    expect(createSectionFromPreset('privacy', 'en').entries[0]?.title).toMatch(/consent/)
    for (const id of SECTION_PRESET_IDS.filter((p) => p !== 'references' && p !== 'privacy')) {
      expect(createSectionFromPreset(id, 'es').entries).toEqual([])
    }
  })

  it('has a button label for each preset in both UI languages', () => {
    for (const dict of [es, en]) {
      expect(Object.keys(dict.custom.presets).sort()).toEqual([...SECTION_PRESET_IDS].sort())
    }
  })
})
