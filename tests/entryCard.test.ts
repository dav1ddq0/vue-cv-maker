// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import StepExperience from '@/components/form/StepExperience.vue'
import StepSummary from '@/components/form/StepSummary.vue'
import { useCvStore } from '@/stores/cv'
import { createExperience } from '@/core/factory'

beforeEach(() => setActivePinia(createPinia()))

describe('collapsible entries (spec 018)', () => {
  it('opens the first entry, folds the rest to a summary line', () => {
    const cv = useCvStore()
    cv.data.experience = [
      { ...createExperience(), position: 'Senior', company: 'Cartograf', startDate: '2022-03', endDate: null, location: 'Remoto' },
      { ...createExperience(), position: 'Dev', company: 'Nube', startDate: '2019-09', endDate: '2022-02' },
    ]
    const wrapper = mount(StepExperience)
    const toggles = wrapper.findAll('button.summary')
    expect(toggles.map((b) => b.attributes('aria-expanded'))).toEqual(['true', 'false'])
    expect(toggles[0]!.text()).toContain('Senior · Cartograf')
    expect(toggles[0]!.text()).toContain('Actualidad · Remoto')
  })

  it('toggles one entry and opens a newly added one', async () => {
    const cv = useCvStore()
    cv.data.experience = [{ ...createExperience(), position: 'A' }]
    const wrapper = mount(StepExperience)
    await wrapper.find('button.summary').trigger('click')
    expect(wrapper.find('button.summary').attributes('aria-expanded')).toBe('false')

    cv.data.experience.push(createExperience())
    await wrapper.vm.$nextTick()
    const toggles = wrapper.findAll('button.summary')
    expect(toggles[1]!.attributes('aria-expanded')).toBe('true')
    expect(toggles[1]!.text()).toContain('Puesto nuevo')
  })
})

describe('summary length meter', () => {
  it('says whether the summary is short, good or long', async () => {
    const cv = useCvStore()
    const wrapper = mount(StepSummary)
    expect(wrapper.find('.length').exists()).toBe(false)
    cv.data.summary = 'x'.repeat(80)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.verdict').text()).toBe('80 caracteres · corto: apunta a 150–450')
    cv.data.summary = 'x'.repeat(300)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.verdict').text()).toContain('buena longitud')
    cv.data.summary = 'x'.repeat(500)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.verdict').text()).toContain('largo')
  })
})
