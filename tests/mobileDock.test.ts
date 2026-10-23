// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import MobileDock from '@/components/form/MobileDock.vue'
import { useUiStore } from '@/stores/ui'

beforeEach(() => setActivePinia(createPinia()))

const text = (wrapper: ReturnType<typeof mount>, label: string) =>
  wrapper.findAll('button').find((b) => b.text().includes(label))!

describe('MobileDock', () => {
  it('names the next step on the primary button', () => {
    const ui = useUiStore()
    ui.goTo('personal')
    const wrapper = mount(MobileDock)
    expect(wrapper.find('.next').text()).toBe('Siguiente: Resumen')
  })

  it('moves through the steps and disables the ends', async () => {
    const ui = useUiStore()
    const wrapper = mount(MobileDock)
    expect(wrapper.find('.back').attributes('disabled')).toBeDefined()
    await wrapper.find('.next').trigger('click')
    expect(ui.step).toBe('summary')
    await wrapper.find('.back').trigger('click')
    expect(ui.step).toBe('personal')

    ui.goTo('export')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.next').attributes('disabled')).toBeDefined()
  })

  it('switches between editing and preview and keeps a way back', async () => {
    const ui = useUiStore()
    const wrapper = mount(MobileDock)
    expect(text(wrapper, 'Editar').attributes('aria-pressed')).toBe('true')

    await text(wrapper, 'Vista previa').trigger('click')
    expect(ui.previewOpen).toBe(true)
    expect(text(wrapper, 'Vista previa').attributes('aria-pressed')).toBe('true')
    expect(wrapper.find('.nav').exists()).toBe(false)

    await text(wrapper, 'Editar').trigger('click')
    expect(ui.previewOpen).toBe(false)
    expect(wrapper.find('.nav').exists()).toBe(true)
  })
})

describe('MobileDock in preview mode', () => {
  it('offers the PDF export as the main action and the other formats behind a menu', async () => {
    const ui = useUiStore()
    ui.previewOpen = true
    const wrapper = mount(MobileDock)
    expect(wrapper.find('.nav').exists()).toBe(false)
    expect(wrapper.find('.exports .next').text()).toBe('Imprimir / Guardar como PDF')
    expect(wrapper.find('.exports .more').attributes('aria-label')).toBe('Más formas de exportar')
  })
})
