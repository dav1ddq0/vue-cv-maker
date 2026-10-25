// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import WelcomeView from '@/components/documents/WelcomeView.vue'
import { useUiStore } from '@/stores/ui'
import { useCvStore } from '@/stores/cv'
import { templates } from '@/templates/registry'

beforeEach(() => setActivePinia(createPinia()))

describe('WelcomeView (spec 019)', () => {
  it('offers blank, sample and import, and counts the real templates', () => {
    const wrapper = mount(WelcomeView)
    expect(wrapper.findAll('button.choice').map((b) => b.find('.choice-title').text())).toEqual([
      'En blanco',
      'Desde un ejemplo',
      'Importar',
    ])
    expect(wrapper.find('.points').text()).toContain(`${templates.length} plantillas`)
  })

  it('opens the wizard, loads the sample or goes to import', async () => {
    const ui = useUiStore()
    const cv = useCvStore()
    const createNew = vi.spyOn(cv, 'createNew').mockResolvedValue()
    const wrapper = mount(WelcomeView)
    const [blank, sample, importer] = wrapper.findAll('button.choice')

    ui.view = 'welcome'
    await blank!.trigger('click')
    expect(ui.view).toBe('editor')
    expect(ui.step).toBe('personal')

    await sample!.trigger('click')
    expect(createNew).toHaveBeenCalledWith({ seed: expect.objectContaining({ personal: expect.any(Object) }) })

    await importer!.trigger('click')
    expect(ui.view).toBe('import')
  })
})
