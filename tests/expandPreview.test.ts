// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PreviewPane from '@/components/preview/PreviewPane.vue'
import StepRail from '@/components/form/StepRail.vue'
import { useUiStore } from '@/stores/ui'
import { DESKTOP_QUERY } from '@/composables/useIsPhone'

/** A desktop-wide viewport: only the desktop query matches. */
function desktop() {
  window.matchMedia = vi.fn((query: string) => ({
    matches: query === DESKTOP_QUERY,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia
}

beforeEach(() => setActivePinia(createPinia()))
afterEach(() => {
  // @ts-expect-error restore the jsdom default (no matchMedia)
  delete window.matchMedia
})

describe('expanded preview state (spec 030)', () => {
  it('collapses when a step is picked or the editor is left', async () => {
    const ui = useUiStore()
    ui.previewExpanded = true
    ui.goTo('skills')
    expect(ui.previewExpanded).toBe(false)

    ui.previewExpanded = true
    ui.view = 'documents'
    await nextTick()
    expect(ui.previewExpanded).toBe(false)
  })
})

describe('expand button (spec 030)', () => {
  const mountPane = () => mount(PreviewPane, { global: { stubs: { CvRenderer: true } } })

  it('is offered on desktop and toggles the expanded preview', async () => {
    desktop()
    const ui = useUiStore()
    const wrapper = mountPane()
    const button = wrapper.find('button.expand')
    expect(button.attributes('aria-label')).toBe('Ampliar vista previa')
    expect(button.attributes('aria-pressed')).toBe('false')
    await button.trigger('click')
    expect(ui.previewExpanded).toBe(true)
    expect(button.attributes('aria-label')).toBe('Reducir vista previa')
    expect(button.attributes('aria-pressed')).toBe('true')
  })

  it('is not offered below desktop width', () => {
    expect(mountPane().find('button.expand').exists()).toBe(false)
  })
})

describe('compact step rail (spec 030)', () => {
  it('shows badges only, each still named, and picking one brings the form back', async () => {
    const ui = useUiStore()
    ui.previewExpanded = true
    const wrapper = mount(StepRail, { props: { compact: true } })
    expect(wrapper.find('.progress').exists()).toBe(false)
    expect(wrapper.find('.text').exists()).toBe(false)
    expect(wrapper.find('.add').exists()).toBe(false)
    const rows = wrapper.findAll('button.row')
    expect(rows).toHaveLength(9)
    expect(rows[0]!.attributes('aria-label')).toMatch(/^Datos personales( · .+)?$/)
    expect(rows[0]!.attributes('title')).toBe(rows[0]!.attributes('aria-label'))
    await rows[3]!.trigger('click')
    expect(ui.step).toBe('education')
    expect(ui.previewExpanded).toBe(false)
  })
})
