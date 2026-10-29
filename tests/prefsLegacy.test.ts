// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { readPrefs, writePrefs } from '@/services/prefs'

describe('preferences kept under the name before the rename (spec 039)', () => {
  beforeEach(() => localStorage.clear())

  it('reads the old key while the new one is empty', () => {
    localStorage.setItem('cv-maker:prefs', JSON.stringify({ uiLanguage: 'en', theme: 'dark' }))
    expect(readPrefs()).toMatchObject({ uiLanguage: 'en', theme: 'dark' })
  })

  it('prefers the new key once it exists', () => {
    localStorage.setItem('cv-maker:prefs', JSON.stringify({ uiLanguage: 'en' }))
    localStorage.setItem('keireki-craft:prefs', JSON.stringify({ uiLanguage: 'es' }))
    expect(readPrefs().uiLanguage).toBe('es')
  })

  it('writes the new key, carrying over what the old one held, and leaves the old one alone', () => {
    localStorage.setItem('cv-maker:prefs', JSON.stringify({ uiLanguage: 'en', theme: 'dark' }))
    writePrefs({ lastCvId: 'cv-1' })
    expect(JSON.parse(localStorage.getItem('keireki-craft:prefs')!)).toMatchObject({ uiLanguage: 'en', theme: 'dark', lastCvId: 'cv-1' })
    expect(JSON.parse(localStorage.getItem('cv-maker:prefs')!)).toEqual({ uiLanguage: 'en', theme: 'dark' })
  })

  it('falls back to the defaults when neither key exists', () => {
    expect(readPrefs()).toMatchObject({ uiLanguage: 'es', theme: 'system' })
  })
})
