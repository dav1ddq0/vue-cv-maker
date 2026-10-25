// @vitest-environment jsdom
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import StepHeader from '@/components/form/StepHeader.vue'
import { useUiStore } from '@/stores/ui'
import { useCvStore } from '@/stores/cv'

// jsdom ships <dialog> without showModal/close; a minimal stand-in keeps `open` and fires `close`.
beforeAll(() => {
  const proto = HTMLDialogElement.prototype
  proto.showModal = function (this: HTMLDialogElement) { this.setAttribute('open', '') }
  proto.close = function (this: HTMLDialogElement) {
    if (!this.hasAttribute('open')) return
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
})

beforeEach(() => setActivePinia(createPinia()))

const mountHeader = () => mount(StepHeader, { attachTo: document.body })

describe('StepHeader and step sheet', () => {
  it('shows the position and the current step', () => {
    const ui = useUiStore()
    ui.goTo('experience')
    const wrapper = mountHeader()
    expect(wrapper.find('.position').text()).toBe('3 de 9')
    expect(wrapper.find('.name').text()).toBe('Experiencia')
    expect(wrapper.findAll('.segment--on')).toHaveLength(3)
  })

  it('moves with the arrows and disables them at the ends', async () => {
    const ui = useUiStore()
    const wrapper = mountHeader()
    const [prev, next] = wrapper.findAll('button.arrow')
    expect(prev!.attributes('disabled')).toBeDefined()
    await next!.trigger('click')
    expect(ui.step).toBe('summary')
    expect(next!.attributes('aria-label')).toBe('Paso siguiente: Experiencia')
    await prev!.trigger('click')
    expect(ui.step).toBe('personal')

    ui.goTo('export')
    await wrapper.vm.$nextTick()
    expect(next!.attributes('disabled')).toBeDefined()
  })

  it('opens a labelled modal sheet from the heading button', async () => {
    const wrapper = mountHeader()
    expect(wrapper.find('dialog').attributes('open')).toBeUndefined()
    await wrapper.find('button.trigger').trigger('click')
    const dialog = wrapper.find('dialog')
    expect(dialog.attributes('open')).toBeDefined()
    expect(dialog.attributes('aria-labelledby')).toBe(dialog.find('h2').attributes('id'))
    expect(dialog.findAll('li')).toHaveLength(9)
  })

  it('goes to the chosen step and closes the sheet', async () => {
    const ui = useUiStore()
    const wrapper = mountHeader()
    await wrapper.find('button.trigger').trigger('click')
    await wrapper.findAll('dialog li button')[4]!.trigger('click')
    expect(ui.step).toBe('skills')
    expect(wrapper.find('dialog').attributes('open')).toBeUndefined()
  })

  it('marks the current step and reports the state of the others', async () => {
    const cv = useCvStore()
    cv.data.personal.fullName = 'Ana'
    cv.data.personal.email = 'ana@correo.com'
    const ui = useUiStore()
    ui.goTo('summary')
    const wrapper = mountHeader()
    await wrapper.find('button.trigger').trigger('click')
    const rows = wrapper.findAll('dialog li button')
    expect(rows[1]!.attributes('aria-current')).toBe('step')
    expect(rows[1]!.text()).toContain('Estás aquí')
    expect(rows[0]!.text()).toContain('Completo')
    expect(rows[2]!.text()).toContain('Falta contenido')
    expect(rows[5]!.text()).toContain('Opcional')
  })

  it('closes with the close button', async () => {
    const wrapper = mountHeader()
    await wrapper.find('button.trigger').trigger('click')
    await wrapper.find('dialog .close').trigger('click')
    expect(wrapper.find('dialog').attributes('open')).toBeUndefined()
  })
})
