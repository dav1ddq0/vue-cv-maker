// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { getTemplate } from '@/templates/registry'
import { createSampleCV } from '@/core/sample'

describe.each(['meridian', 'banner'])('%s language levels', (id) => {
  it('shows dots with an accessible label for recognised levels, in the CV language', async () => {
    const component = await getTemplate(id).component()

    const es = mount(component as any, { props: { data: createSampleCV() } })
    expect(es.findAll('[role="img"]').map((n) => n.attributes('aria-label'))).toEqual([
      'Nivel 5 de 5',
      'Nivel 5 de 5',
      'Nivel 3 de 5',
    ])

    const data = createSampleCV()
    data.meta.language = 'en'
    const en = mount(component as any, { props: { data } })
    expect(en.find('[role="img"]').attributes('aria-label')).toBe('Level 5 of 5')
  })

  it('falls back to the typed text when the level is not recognised', async () => {
    const data = createSampleCV()
    data.languages = [{ id: 'l1', name: 'Catalán', level: 'Muy bueno' }]
    const component = await getTemplate(id).component()
    const wrapper = mount(component as any, { props: { data } })

    expect(wrapper.find('[role="img"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Catalán — Muy bueno')
  })
})
