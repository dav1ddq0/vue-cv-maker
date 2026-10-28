import { describe, expect, it } from 'vitest'
import { migrate } from '@/core/migrations'
import { printTitle } from '@/services/export/pdf'
import { createEmptyCV } from '@/core/factory'

describe('import hardening (spec 034)', () => {
  it('types every field a hostile or broken file can get wrong', () => {
    const cv = migrate({
      schemaVersion: 5,
      meta: { id: 7, title: { x: 1 }, language: ['es'], createdAt: null, templateId: 3 },
      personal: { fullName: 'Ana' },
      experience: [{ position: 42, company: null, startDate: 2020, endDate: { y: 1 }, highlights: [1, 'ok'] }],
      education: [{ degree: 42, institution: {}, startDate: { y: 2015 }, endDate: 2019 }],
      skills: [{ category: ['x'], items: [{ name: 5, level: 9 }] }],
      languages: [{ name: { n: 1 }, level: 5 }],
      customSections: [{ title: 1, entries: [{ title: {}, subtitle: 2, date: ['2020'], description: null }] }],
    })
    expect(typeof cv.meta.id).toBe('string')
    expect(cv.meta.id).not.toBe('')
    expect(cv.meta.title).toBe(createEmptyCV().meta.title)
    expect(cv.meta.language).toBe('es')
    expect(typeof cv.meta.createdAt).toBe('string')
    expect(cv.experience[0]).toMatchObject({ position: '', company: '', startDate: '', endDate: '', highlights: ['', 'ok'] })
    expect(cv.education[0]).toMatchObject({ degree: '', institution: '', startDate: '', endDate: '' })
    expect(cv.skills[0]).toMatchObject({ category: '', items: [{ name: '' }] })
    expect(cv.languages[0]).toMatchObject({ name: '', level: '' })
    expect(cv.customSections[0]!.entries[0]).toMatchObject({ title: '', subtitle: '', date: '', description: '' })
  })

  it('keeps an ongoing education ("currently studying") through a JSON round trip', () => {
    const source = createEmptyCV()
    source.education = [{ id: 'e1', degree: 'Máster', institution: 'UPV', startDate: '2025-09', endDate: null }]
    const back = migrate(JSON.parse(JSON.stringify(source)))
    expect(back.education[0]!.endDate).toBeNull()
    // A missing end stays "no end date", as before.
    expect(migrate({ schemaVersion: 5, education: [{ degree: 'X' }] }).education[0]!.endDate).toBe('')
  })

  it('keeps the CV language to the ones templates have words for', () => {
    expect(migrate({ schemaVersion: 5, meta: { language: 'en' } }).meta.language).toBe('en')
    expect(migrate({ schemaVersion: 5, meta: { language: 'es" onload="x' } }).meta.language).toBe('es')
  })

  it('keeps control and bidi characters out of the PDF name and title', () => {
    const cv = createEmptyCV()
    cv.personal.fullName = 'Ana‮fdp.exe\u0007 Ruiz'
    expect(printTitle(cv)).toBe('Anafdp.exe Ruiz – CV')
  })
})
