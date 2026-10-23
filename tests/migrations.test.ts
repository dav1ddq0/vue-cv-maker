import { describe, expect, it } from 'vitest'
import { migrate, normalize, reconcileOrder, UnsupportedSchemaError } from '@/core/migrations'
import { createEmptyCV } from '@/core/factory'
import { SCHEMA_VERSION } from '@/types/cv'

describe('migrate', () => {
  it('fills every missing field of a minimal object', () => {
    const cv = migrate({ schemaVersion: 1, personal: { fullName: 'Ada' } })

    expect(cv.schemaVersion).toBe(SCHEMA_VERSION)
    expect(cv.personal.fullName).toBe('Ada')
    expect(cv.experience).toEqual([])
    expect(cv.style.accentColor).toBeTruthy()
    expect(cv.meta.id).toBeTruthy()
  })

  it('rejects a file from a newer schema instead of guessing', () => {
    expect(() => migrate({ schemaVersion: 99 })).toThrow(UnsupportedSchemaError)
  })

  it('issues ids for list items that lack them', () => {
    const cv = migrate({
      schemaVersion: 1,
      experience: [{ position: 'Dev' }, { position: 'Lead' }],
    })

    const ids = cv.experience.map((entry) => entry.id)
    expect(ids.every(Boolean)).toBe(true)
    expect(new Set(ids).size).toBe(2)
  })

  it('clamps style scales into the supported range', () => {
    const cv = migrate({ schemaVersion: 1, style: { fontScale: 5, spacingScale: 0.1 } })
    expect(cv.style.fontScale).toBe(1.15)
    expect(cv.style.spacingScale).toBe(0.85)
  })
})

describe('normalize', () => {
  it('never drops data the caller provided', () => {
    const source = createEmptyCV()
    source.summary = 'Hello'
    source.languages = [{ id: 'l1', name: 'Español', level: 'Nativo' }]

    expect(normalize(JSON.parse(JSON.stringify(source)))).toMatchObject({
      summary: 'Hello',
      languages: [{ name: 'Español', level: 'Nativo' }],
    })
  })
})

describe('reconcileOrder', () => {
  it('keeps the stored order and appends unknown sections', () => {
    const cv = createEmptyCV()
    cv.customSections = [{ id: 'cus_1', title: 'Talks', entries: [] }]

    const order = reconcileOrder(['skills', 'summary'], cv)

    expect(order.slice(0, 2)).toEqual(['skills', 'summary'])
    expect(order).toContain('cus_1')
    expect(new Set(order).size).toBe(order.length)
  })

  it('drops ids of sections that no longer exist', () => {
    const cv = createEmptyCV()
    expect(reconcileOrder(['summary', 'cus_gone'], cv)).not.toContain('cus_gone')
  })
})

describe('schema v1 → v2 (skill items)', () => {
  it('turns string items into objects, keeping text and order', () => {
    const cv = migrate({
      schemaVersion: 1,
      skills: [{ id: 'skg_1', category: 'Lang', items: ['TypeScript', 'Go'] }],
    })

    expect(cv.schemaVersion).toBe(SCHEMA_VERSION)
    expect(cv.skills[0]!.items).toEqual([{ name: 'TypeScript' }, { name: 'Go' }])
  })

  it('leaves a v2 file untouched', () => {
    const cv = migrate({
      schemaVersion: 2,
      skills: [{ id: 'skg_1', category: '', items: [{ name: 'Vue', level: 4 }] }],
    })
    expect(cv.skills[0]!.items).toEqual([{ name: 'Vue', level: 4 }])
  })

  it('drops an invalid level but keeps the skill', () => {
    const cv = migrate({
      schemaVersion: 2,
      skills: [{ id: 's', category: '', items: [{ name: 'A', level: 9 }, { name: 'B', level: 2.5 }, { name: 'C', level: '3' }] }],
    })
    expect(cv.skills[0]!.items).toEqual([{ name: 'A' }, { name: 'B' }, { name: 'C' }])
  })

  it('survives garbage items without throwing', () => {
    const cv = migrate({ schemaVersion: 1, skills: [{ items: [null, 7, 'ok'] }] })
    expect(cv.skills[0]!.items.map((i) => i.name)).toEqual(['', '', 'ok'])
  })
})

describe('schema v2 → v3 (optional personal data)', () => {
  it('gives a v2 file empty extras and keeps what it had', () => {
    const cv = migrate({
      schemaVersion: 2,
      personal: { fullName: 'Ana', email: 'ana@correo.com', phone: '', location: 'Valencia', links: [] },
    })
    expect(cv.schemaVersion).toBe(3)
    expect(cv.personal).toMatchObject({
      fullName: 'Ana',
      location: 'Valencia',
      birthDate: '',
      birthPlace: '',
      nationality: '',
      drivingLicense: '',
      maritalStatus: '',
    })
  })

  it('keeps extras a v3 file already has', () => {
    const cv = migrate({
      schemaVersion: 3,
      personal: { birthDate: '1992-03-12', nationality: 'Española', maritalStatus: 'single', drivingLicense: 'B' },
    })
    expect(cv.personal.birthDate).toBe('1992-03-12')
    expect(cv.personal.nationality).toBe('Española')
    expect(cv.personal.maritalStatus).toBe('single')
    expect(cv.personal.drivingLicense).toBe('B')
  })

  it('turns an unknown marital status or a non-string into empty instead of rendering it', () => {
    const cv = migrate({
      schemaVersion: 3,
      personal: { maritalStatus: 'complicated', birthPlace: 42, nationality: null },
    })
    expect(cv.personal.maritalStatus).toBe('')
    expect(cv.personal.birthPlace).toBe('')
    expect(cv.personal.nationality).toBe('')
  })

  it('walks a v1 file all the way up', () => {
    const cv = migrate({ schemaVersion: 1, skills: [{ items: ['Go'] }] })
    expect(cv.schemaVersion).toBe(3)
    expect(cv.personal.maritalStatus).toBe('')
    expect(cv.skills[0]!.items).toEqual([{ name: 'Go' }])
  })
})
