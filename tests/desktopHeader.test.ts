// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import DesktopHeader from '@/components/DesktopHeader.vue'
import { useUiStore } from '@/stores/ui'
import { useCvStore } from '@/stores/cv'

beforeEach(() => setActivePinia(createPinia()))

describe('DesktopHeader', () => {
  it('shows the breadcrumb with an editable document name in the editor', async () => {
    const cv = useCvStore()
    const wrapper = mount(DesktopHeader)
    const input = wrapper.find('input.doc-title')
    expect(input.attributes('aria-label')).toBe('Nombre del documento')
    await input.setValue('CV para Cartograf')
    expect(cv.data.meta.title).toBe('CV para Cartograf')
  })

  it('names undo and redo with their shortcut and emits export', async () => {
    const wrapper = mount(DesktopHeader)
    const labels = wrapper.findAll('button.icon').map((b) => b.attributes('aria-label'))
    expect(labels).toEqual(['Deshacer (Ctrl+Z)', 'Rehacer (Ctrl+Mayús+Z)'])
    await wrapper.find('button.primary').trigger('click')
    expect(wrapper.emitted('export')).toHaveLength(1)
  })

  it('shows the three views and no export button outside the editor', async () => {
    const ui = useUiStore()
    ui.view = 'documents'
    const wrapper = mount(DesktopHeader)
    const views = wrapper.findAll('button.view')
    expect(views.map((b) => b.text())).toEqual(['Editor', 'Mis CVs', 'Importar'])
    expect(views[1]!.attributes('aria-current')).toBe('page')
    expect(wrapper.find('button.primary').exists()).toBe(false)
  })
})
