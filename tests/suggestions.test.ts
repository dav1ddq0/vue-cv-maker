import { describe, expect, it } from 'vitest'
import { cvScore, isBefore, suggest } from '@/core/suggestions'
import { createEmptyCV, createExperience } from '@/core/factory'
import { createSampleCV } from '@/core/sample'

const ids = (data: Parameters<typeof suggest>[0]) => suggest(data).map((s) => s.id)

const job = (patch: Partial<ReturnType<typeof createExperience>>) => ({ ...createExperience(), ...patch })

describe('suggest (spec 023)', () => {
  it('has nothing to add to the sample CV, which scores 100', () => {
    expect(suggest(createSampleCV())).toEqual([])
    expect(cvScore(createSampleCV())).toBe(100)
  })

  it('lists the core gaps of an empty CV, important first, then in step order', () => {
    expect(ids(createEmptyCV())).toEqual([
      'name',
      'contact',
      'summary',
      'experience',
      'education',
      'skills',
      'headline',
      'links',
      'languages',
    ])
    expect(cvScore(createEmptyCV())).toBe(0)
  })

  it('accepts a phone instead of an email as contact', () => {
    const cv = createSampleCV()
    cv.personal.email = ''
    expect(ids(cv)).not.toContain('contact')
    cv.personal.phone = ' '
    expect(ids(cv)).toContain('contact')
  })

  it('flags a summary outside 150–450 characters, but not a missing one twice', () => {
    const cv = createSampleCV()
    cv.summary = 'Corto.'
    expect(suggest(cv).find((s) => s.id === 'summaryShort')?.params).toEqual({ n: 6, min: 150 })
    cv.summary = 'x'.repeat(451)
    expect(ids(cv)).toContain('summaryLong')
    cv.summary = ''
    expect(ids(cv)).toEqual(['summary'])
  })

  it('names the jobs without a start date or ending before they start, up to three', () => {
    const cv = createSampleCV()
    cv.experience = [
      job({ position: 'Dev', company: 'A', startDate: '', description: 'Lideré 3 proyectos' }),
      job({ position: 'Dev', company: 'B', startDate: '2022-05', endDate: '2021', description: 'x' }),
      job({ position: 'Dev', company: 'C', startDate: '2020-04', endDate: '2020', description: 'x' }),
    ]
    const dates = suggest(cv).filter((s) => s.id === 'experienceDates')
    expect(dates.map((s) => s.params.entry)).toEqual(['Dev · A', 'Dev · B'])

    cv.experience = Array.from({ length: 5 }, (_, i) => job({ position: `P${i}`, startDate: '' }))
    expect(suggest(cv).filter((s) => s.id === 'experienceDates')).toHaveLength(3)
  })

  it('asks for a description, and for a figure once there is text without any', () => {
    const cv = createSampleCV()
    cv.experience = [job({ position: 'Dev', company: 'A', startDate: '2022' })]
    expect(ids(cv)).toContain('experienceText')
    expect(ids(cv)).not.toContain('experienceImpact')

    cv.experience[0]!.highlights = ['Mejoré el rendimiento del visor']
    expect(ids(cv)).not.toContain('experienceText')
    expect(ids(cv)).toContain('experienceImpact')

    cv.experience[0]!.highlights = ['Reduje la carga de 4 s a 1 s']
    expect(ids(cv)).not.toContain('experienceImpact')
  })

  it('suggests putting the most recent job first', () => {
    const cv = createSampleCV()
    cv.experience = [
      job({ position: 'Old', startDate: '2018', description: '2 años' }),
      job({ position: 'New', startDate: '2022-03', description: '5 personas' }),
    ]
    expect(ids(cv)).toContain('experienceOrder')
    cv.experience.reverse()
    expect(ids(cv)).not.toContain('experienceOrder')
  })

  it('counts named skills only, and asks for more than three', () => {
    const cv = createSampleCV()
    cv.skills = [{ id: 'g', category: '', items: [{ name: 'Go' }, { name: ' ' }] }]
    expect(suggest(cv).find((s) => s.id === 'skillsFew')?.params).toEqual({ n: 1 })
    cv.skills = [{ id: 'g', category: '', items: [{ name: ' ' }] }]
    expect(ids(cv)).toContain('skills')
    expect(ids(cv)).not.toContain('skillsFew')
  })

  it('weighs an important rule twice a tip in the score', () => {
    const noHeadline = createSampleCV()
    noHeadline.personal.headline = ''
    const noName = createSampleCV()
    noName.personal.fullName = ''
    expect(100 - cvScore(noName)).toBeGreaterThan(100 - cvScore(noHeadline))
    expect(cvScore(noHeadline)).toBeLessThan(100)
  })
})

describe('isBefore', () => {
  it('compares partial dates on their common precision', () => {
    expect(isBefore('2021', '2022-05')).toBe(true)
    expect(isBefore('2023', '2023-04')).toBe(false)
    expect(isBefore('2023-03', '2023-04')).toBe(true)
  })
})
