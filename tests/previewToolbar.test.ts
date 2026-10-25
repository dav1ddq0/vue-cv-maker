// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PreviewPane from '@/components/preview/PreviewPane.vue'
import { useUiStore } from '@/stores/ui'
import { getTemplate } from '@/templates/registry'

beforeEach(() => setActivePinia(createPinia()))

const mountPane = () => mount(PreviewPane, { global: { stubs: { CvRenderer: true } } })

describe('preview toolbar (spec 018)', () => {
  it('names the template and sends its button to the style step', async () => {
    const ui = useUiStore()
    const wrapper = mountPane()
    const chip = wrapper.find('button.chip')
    expect(chip.text()).toContain(getTemplate(ui.templateId).name)
    await chip.trigger('click')
    expect(ui.step).toBe('style')
  })

  it('zooms in steps of 10 % within its bounds', async () => {
    const wrapper = mountPane()
    const [out, into] = wrapper.findAll('button.zoom-btn')
    const value = () => wrapper.find('.zoom-value').text()
    expect(value()).toBe('72 %')
    await into!.trigger('click')
    expect(value()).toBe('80 %')
    for (let i = 0; i < 10; i++) await out!.trigger('click')
    expect(value()).toBe('40 %')
    expect(out!.attributes('disabled')).toBeDefined()
  })
})
