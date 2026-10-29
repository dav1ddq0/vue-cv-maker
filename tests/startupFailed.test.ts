// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import StartupFailed from '@/components/StartupFailed.vue'

describe('StartupFailed (spec 042)', () => {
  it('says why the app did not start and offers to try again', () => {
    const wrapper = mount(StartupFailed)
    expect(wrapper.find('main.startup-failed').text()).toContain('No se pudo abrir el almacenamiento')
    expect(wrapper.find('button').text()).toBe('Recargar')
  })

  it('asks its parent to reload, and does nothing else by itself', async () => {
    const wrapper = mount(StartupFailed)
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('reload')).toHaveLength(1)
  })
})
