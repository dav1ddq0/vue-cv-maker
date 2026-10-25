// @vitest-environment jsdom
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/services/export', () => ({
  exportHtml: vi.fn(async () => {}),
  exportJson: vi.fn(async () => {}),
  printCv: vi.fn(async () => {}),
}))

import * as exporters from '@/services/export'
import ExportDialog from '@/components/form/ExportDialog.vue'
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

describe('ExportDialog', () => {
  it('lists the core steps still missing content and jumps to one', async () => {
    const ui = useUiStore()
    const wrapper = mount(ExportDialog, { props: { open: false }, attachTo: document.body })
    await wrapper.setProps({ open: true })
    const fixes = wrapper.findAll('button.fix').map((b) => b.text())
    expect(fixes).toContain('Datos personales: falta contenido')
    expect(fixes).toContain('Competencias: falta contenido')
    expect(fixes.some((f) => f.startsWith('Idiomas'))).toBe(false)

    await wrapper.findAll('button.fix')[0]!.trigger('click')
    expect(ui.step).toBe('personal')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('names the action after the format and runs that export', async () => {
    useCvStore()
    const wrapper = mount(ExportDialog, { props: { open: false }, attachTo: document.body })
    await wrapper.setProps({ open: true })
    expect(wrapper.find('button.primary').text()).toBe('Imprimir / Guardar como PDF')

    await wrapper.find('input[value="json"]').setValue(true)
    expect(wrapper.find('button.primary').text()).toBe('Descargar JSON')
    await wrapper.find('button.primary').trigger('click')
    await vi.waitFor(() => expect(exporters.exportJson).toHaveBeenCalledTimes(1))
    expect(exporters.printCv).not.toHaveBeenCalled()
  })
})
