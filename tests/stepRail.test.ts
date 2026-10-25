// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import StepRail from '@/components/form/StepRail.vue'
import { useUiStore } from '@/stores/ui'
import { useCvStore } from '@/stores/cv'

beforeEach(() => setActivePinia(createPinia()))

describe('StepRail', () => {
  it('lists the nine steps and marks the current one', () => {
    const ui = useUiStore()
    ui.goTo('experience')
    const wrapper = mount(StepRail)
    const rows = wrapper.findAll('button.row')
    expect(rows).toHaveLength(9)
    expect(rows[2]!.attributes('aria-current')).toBe('step')
    expect(rows[2]!.text()).toContain('Estás aquí')
  })

  it('counts complete steps, leaving export out of the total', () => {
    const cv = useCvStore()
    cv.data.personal.fullName = 'Ana'
    cv.data.personal.email = 'ana@example.com'
    const wrapper = mount(StepRail)
    // Personal is complete and Style always is: 2 of the 8 steps that hold data.
    expect(wrapper.find('.progress-line').text()).toContain('2 de 8 completos')
  })

  it('goes to a step and sends "Add section" to the custom step', async () => {
    const ui = useUiStore()
    const wrapper = mount(StepRail)
    await wrapper.findAll('button.row')[4]!.trigger('click')
    expect(ui.step).toBe('skills')
    await wrapper.find('button.add').trigger('click')
    expect(ui.step).toBe('custom')
  })
})

describe('CvWizard scroll (spec 019)', () => {
  it('starts each step at the top of the form', async () => {
    const { default: CvWizard } = await import('@/components/form/CvWizard.vue')
    const ui = useUiStore()
    const wrapper = mount(CvWizard, { global: { stubs: { TagInput: true } } })
    const el = wrapper.element as HTMLElement
    el.scrollTop = 400
    ui.goTo('summary')
    await wrapper.vm.$nextTick()
    expect(el.scrollTop).toBe(0)
  })
})
