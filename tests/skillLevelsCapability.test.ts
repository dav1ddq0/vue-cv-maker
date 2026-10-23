// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { templates } from '@/templates/registry'
import { createSampleCV } from '@/core/sample'
import StepSkills from '@/components/form/StepSkills.vue'
import { useCvStore } from '@/stores/cv'
import { useUiStore } from '@/stores/ui'

/**
 * A template must declare `skillLevels` exactly when it draws a rated skill's level, so the
 * skills step can tell the user the truth about what this template will print.
 */
describe.each(templates)('$name and skillLevels', (definition) => {
  it('declares the capability if and only if it draws a rated skill', async () => {
    const data = createSampleCV()
    data.languages = [] // languages draw marks too; isolate the skills
    const component = await definition.component()
    const wrapper = mount(component as any, { props: { data } })

    const drawsLevels = wrapper.find('[role="img"]').exists()
    expect(definition.supports.includes('skillLevels')).toBe(drawsLevels)
  })
})

describe('skills step', () => {
  beforeEach(() => setActivePinia(createPinia()))

  const mountStep = () => {
    const cv = useCvStore()
    cv.data.skills = createSampleCV().skills
    return mount(StepSkills)
  }

  it('disables the level selectors, with the reason, on a template that does not show them', () => {
    useUiStore().setTemplate('classic')
    const wrapper = mountStep()

    const selects = wrapper.findAll('select.level')
    expect(selects.length).toBeGreaterThan(0)
    expect(selects.every((s) => s.attributes('disabled') !== undefined)).toBe(true)
    expect(wrapper.text()).toContain('niveles de habilidad')
  })

  it('keeps the levels already set, and enables the selectors again on a supporting template', async () => {
    const ui = useUiStore()
    ui.setTemplate('classic')
    const wrapper = mountStep()
    const rated = useCvStore().data.skills[0]!.items.filter((i) => i.level !== undefined).length
    expect(rated).toBeGreaterThan(0)

    ui.setTemplate('meridian')
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('select.level').every((s) => s.attributes('disabled') === undefined)).toBe(true)
    expect(useCvStore().data.skills[0]!.items.filter((i) => i.level !== undefined).length).toBe(rated)
  })
})
