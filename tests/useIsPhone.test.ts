// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { PHONE_QUERY, useIsPhone } from '@/composables/useIsPhone'

type Listener = (event: { matches: boolean }) => void

function fakeMatchMedia(matches: boolean) {
  const listeners = new Set<Listener>()
  const list = {
    matches,
    addEventListener: (_: string, fn: Listener) => listeners.add(fn),
    removeEventListener: (_: string, fn: Listener) => listeners.delete(fn),
  }
  const spy = vi.fn(() => list)
  window.matchMedia = spy as unknown as typeof window.matchMedia
  return { listeners, spy, set: (value: boolean) => listeners.forEach((fn) => fn({ matches: value })) }
}

function mountProbe() {
  let isPhone!: ReturnType<typeof useIsPhone>
  const wrapper = mount(defineComponent({ setup() { isPhone = useIsPhone(); return () => null } }))
  return { isPhone, wrapper }
}

afterEach(() => {
  // @ts-expect-error restore the jsdom default (no matchMedia)
  delete window.matchMedia
})

describe('useIsPhone', () => {
  it('reads the current match and follows changes', async () => {
    const media = fakeMatchMedia(true)
    const { isPhone } = mountProbe()
    await nextTick()
    expect(media.spy).toHaveBeenCalledWith(PHONE_QUERY)
    expect(isPhone.value).toBe(true)

    media.set(false)
    expect(isPhone.value).toBe(false)
  })

  it('stops listening on unmount', () => {
    const media = fakeMatchMedia(false)
    const { wrapper } = mountProbe()
    expect(media.listeners.size).toBe(1)
    wrapper.unmount()
    expect(media.listeners.size).toBe(0)
  })

  it('is false when matchMedia does not exist', async () => {
    const { isPhone } = mountProbe()
    await nextTick()
    expect(isPhone.value).toBe(false)
  })
})
