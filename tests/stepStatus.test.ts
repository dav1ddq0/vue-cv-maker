import { describe, expect, it } from 'vitest'
import { createEmptyCV, createExperience, createCustomSection } from '@/core/factory'
import { stepStatus } from '@/core/stepStatus'
import { STEPS } from '@/stores/ui'

const empty = () => createEmptyCV()

describe('stepStatus', () => {
  it('starts every core step incomplete and every extra step optional', () => {
    const data = empty()
    for (const id of ['personal', 'summary', 'experience', 'education', 'skills']) {
      expect(stepStatus(data, id).state).toBe('incomplete')
    }
    for (const id of ['languages', 'custom']) expect(stepStatus(data, id).state).toBe('optional')
  })

  it('needs both a name and an email for the personal step', () => {
    const data = empty()
    data.personal.fullName = 'Ana'
    expect(stepStatus(data, 'personal').state).toBe('incomplete')
    data.personal.email = '  '
    expect(stepStatus(data, 'personal').state).toBe('incomplete')
    data.personal.email = 'ana@correo.com'
    expect(stepStatus(data, 'personal').state).toBe('complete')
  })

  it('counts entries, skill items across groups, and summary characters', () => {
    const data = empty()
    data.experience.push(createExperience(), createExperience())
    data.skills.push(
      { id: 'a', category: 'x', items: [{ name: 'Vue' }, { name: 'Go', level: 4 }] },
      { id: 'b', category: 'y', items: [{ name: 'SQL' }] },
    )
    data.summary = '  Hola  '
    data.customSections.push(createCustomSection('Cursos'))
    expect(stepStatus(data, 'experience')).toEqual({ state: 'complete', count: 2 })
    expect(stepStatus(data, 'skills')).toEqual({ state: 'complete', count: 3 })
    expect(stepStatus(data, 'summary')).toEqual({ state: 'complete', count: 4 })
    expect(stepStatus(data, 'custom')).toEqual({ state: 'complete', count: 1 })
  })

  it('treats whitespace-only summary as empty', () => {
    const data = empty()
    data.summary = '   \n '
    expect(stepStatus(data, 'summary')).toEqual({ state: 'incomplete', count: 0 })
  })

  it('always completes style, never rates export, and ignores unknown ids', () => {
    expect(stepStatus(empty(), 'style').state).toBe('complete')
    expect(stepStatus(empty(), 'export').state).toBe('none')
    expect(stepStatus(empty(), 'nope').state).toBe('none')
  })

  it('answers for every real step id', () => {
    for (const id of STEPS) expect(stepStatus(empty(), id).state).toMatch(/complete|incomplete|optional|none/)
  })
})
