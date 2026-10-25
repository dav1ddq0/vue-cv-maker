import { describe, expect, it } from 'vitest'
import { migrate, normalize, reconcileOrder, UnsupportedSchemaError } from '@/core/migrations'
import { createEmptyCV, DEFAULT_STYLE } from '@/core/factory'
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
    expect(cv.schemaVersion).toBe(SCHEMA_VERSION)
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
    expect(cv.schemaVersion).toBe(SCHEMA_VERSION)
    expect(cv.personal.maritalStatus).toBe('')
    expect(cv.skills[0]!.items).toEqual([{ name: 'Go' }])
  })

  describe('untrusted files (spec 017)', () => {
    it('drops style values that could load a remote resource and keeps valid ones', () => {
      const bad = migrate({
        schemaVersion: 3,
        style: {
          accentColor: 'url(https://attacker.invalid/a.png)',
          fontFamily: 'x; background: url(https://attacker.invalid/f.png)',
          pageMargin: 'url(https://attacker.invalid/m.png)',
        },
      })
      expect(bad.style.accentColor).toBe(DEFAULT_STYLE.accentColor)
      expect(bad.style.fontFamily).toBe(DEFAULT_STYLE.fontFamily)
      expect(bad.style.pageMargin).toBe(DEFAULT_STYLE.pageMargin)

      const good = migrate({
        schemaVersion: 3,
        style: { accentColor: '#AbC', fontFamily: "Georgia, 'Times New Roman', serif", pageMargin: '20mm' },
      })
      expect(good.style.accentColor).toBe('#AbC')
      expect(good.style.fontFamily).toBe("Georgia, 'Times New Roman', serif")
      expect(good.style.pageMargin).toBe('20mm')
    })

    it('keeps a photo only as a stored reference or an inline raster image', () => {
      const photo = (value: unknown) => migrate({ schemaVersion: 3, personal: { photo: value } }).personal.photo
      expect(photo('photo:cv_1')).toBe('photo:cv_1')
      expect(photo('data:image/png;base64,AAAA')).toBe('data:image/png;base64,AAAA')
      expect(photo('https://attacker.invalid/p.png')).toBeUndefined()
      expect(photo('data:image/svg+xml;base64,AAAA')).toBeUndefined()
      expect(photo(42)).toBeUndefined()
      expect('photo' in migrate({ schemaVersion: 3 }).personal).toBe(false)
    })

    it('turns non-string personal fields and link parts into strings', () => {
      const cv = migrate({
        schemaVersion: 3,
        personal: { fullName: { a: 1 }, email: 5, links: [{ label: null, url: ['x'] }] },
      })
      expect(cv.personal.fullName).toBe('')
      expect(cv.personal.email).toBe('')
      expect(cv.personal.links[0]).toMatchObject({ label: '', url: '' })
    })
  })
})


describe('schema v3 → v4 (per-CV template, spec 021)', () => {
  it('gives a v3 file the fallback template, i.e. the one it used to be shown in', () => {
    const cv = migrate({ schemaVersion: 3, meta: { title: 'A' } }, { fallbackTemplateId: 'meridian' })
    expect(cv.schemaVersion).toBe(SCHEMA_VERSION)
    expect(cv.meta.templateId).toBe('meridian')
    expect(cv.meta.title).toBe('A')
  })

  it('uses the default template when there is no fallback', () => {
    expect(migrate({ schemaVersion: 3 }).meta.templateId).toBe('classic')
  })

  it('keeps the template a v4 file names, even one this version does not know', () => {
    const named = { schemaVersion: 4, meta: { templateId: 'from-a-newer-version' } }
    expect(migrate(named, { fallbackTemplateId: 'meridian' }).meta.templateId).toBe('from-a-newer-version')
  })

  it('replaces a non-string or empty template with the fallback', () => {
    expect(migrate({ schemaVersion: 4, meta: { templateId: 7 } }, { fallbackTemplateId: 'nova' }).meta.templateId).toBe('nova')
    expect(migrate({ schemaVersion: 4, meta: { templateId: '' } }).meta.templateId).toBe('classic')
  })

  it('creates new CVs with the default template', () => {
    expect(createEmptyCV().meta.templateId).toBe('classic')
  })
})

describe('schema v4 → v5 (page breaks, spec 022)', () => {
  it('gives a v4 file no breaks', () => {
    const cv = migrate({ schemaVersion: 4 })
    expect(cv.schemaVersion).toBe(5)
    expect(cv.pageBreaks).toEqual([])
  })

  it('keeps only ids of existing sections, once each, in section order', () => {
    const cv = migrate({
      schemaVersion: 5,
      customSections: [{ id: 'cus_1', title: 'Cursos', entries: [] }],
      pageBreaks: ['cus_1', 'education', 'gone', 7, 'education'],
    })
    expect(cv.pageBreaks).toEqual(['education', 'cus_1'])
  })

  it('treats a non-array as no breaks', () => {
    expect(migrate({ schemaVersion: 5, pageBreaks: 'education' }).pageBreaks).toEqual([])
  })
})
