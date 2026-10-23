// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { getTemplate } from '@/templates/registry'
import { createSampleCV } from '@/core/sample'

/** The sample rates some skills; language assertions need a CV without skill dots. */
function withoutSkillLevels() {
  const data = createSampleCV()
  for (const group of data.skills) group.items = group.items.map(({ name }) => ({ name }))
  return data
}

describe.each(['meridian', 'banner', 'ledger', 'harbor', 'frame', 'chevron'])('%s language levels', (id) => {
  it('shows dots with an accessible label for recognised levels, in the CV language', async () => {
    const component = await getTemplate(id).component()

    const es = mount(component as any, { props: { data: withoutSkillLevels() } })
    expect(es.findAll('[role="img"]').map((n) => n.attributes('aria-label'))).toEqual([
      'Nivel 5 de 5',
      'Nivel 5 de 5',
      'Nivel 3 de 5',
    ])

    const data = withoutSkillLevels()
    data.meta.language = 'en'
    const en = mount(component as any, { props: { data } })
    expect(en.find('[role="img"]').attributes('aria-label')).toBe('Level 5 of 5')
  })

  it('falls back to the typed text when the level is not recognised', async () => {
    const data = withoutSkillLevels()
    data.languages = [{ id: 'l1', name: 'Catalán', level: 'Muy bueno' }]
    const component = await getTemplate(id).component()
    const wrapper = mount(component as any, { props: { data } })

    expect(wrapper.find('[role="img"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Catalán — Muy bueno')
  })

  it('draws a level for rated skills only, labelled in the CV language', async () => {
    const data = createSampleCV()
    data.languages = []
    const component = await getTemplate(id).component()
    const wrapper = mount(component as any, { props: { data } })

    // TypeScript 5, Python 4, Go 3, SQL 4 are rated; the Frontend and Backend groups are not.
    expect(wrapper.findAll('[role="img"]').map((n) => n.attributes('aria-label'))).toEqual([
      'Nivel 5 de 5',
      'Nivel 4 de 5',
      'Nivel 3 de 5',
      'Nivel 4 de 5',
    ])
    expect(wrapper.text()).toContain('TypeScript')
    // Unrated groups stay plain text; the separator is the template's own choice.
    expect(wrapper.text()).toMatch(/Vue 3\s?[,·]\s?React\s?[,·]\s?Vite\s?[,·]\s?CSS moderno/)
  })
})
