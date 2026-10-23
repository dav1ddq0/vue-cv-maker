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
