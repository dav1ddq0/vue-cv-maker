// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { resolveTheme } from '@/core/theme'

describe('resolveTheme (spec 019)', () => {
  it('follows the system only when asked to, and reads unknown values as light', () => {
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('sepia' as never, true)).toBe('light')
  })
})

describe('ui store theme', () => {
  afterEach(() => {
    // @ts-expect-error restore the jsdom default (no matchMedia)
    delete window.matchMedia
    localStorage.clear()
  })

  it('keeps "system" as the choice and repaints when the OS switches', async () => {
    let listener: ((event: { matches: boolean }) => void) | undefined
    window.matchMedia = vi.fn(() => ({
      matches: false,
      addEventListener: (_: string, fn: typeof listener) => (listener = fn),
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia

    setActivePinia(createPinia())
    const { useUiStore } = await import('@/stores/ui')
    const ui = useUiStore()
    ui.setTheme('system')
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(JSON.parse(localStorage.getItem('keireki-craft:prefs')!).theme).toBe('system')

    listener!({ matches: true })
    expect(ui.resolvedTheme).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})

describe('theme on Android and first visits (spec 029)', () => {
  afterEach(() => {
    // @ts-expect-error restore the jsdom default (no matchMedia)
    delete window.matchMedia
    localStorage.clear()
    document.head.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.remove())
  })

  it('follows the system on a first visit, and keeps a stored choice', async () => {
    window.matchMedia = vi.fn(() => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} })) as unknown as typeof window.matchMedia
    const { readPrefs } = await import('@/services/prefs')
    expect(readPrefs().theme).toBe('system')
    setActivePinia(createPinia())
    const { useUiStore } = await import('@/stores/ui')
    expect(useUiStore().resolvedTheme).toBe('dark')

    localStorage.setItem('keireki-craft:prefs', JSON.stringify({ theme: 'light' }))
    setActivePinia(createPinia())
    expect(useUiStore().resolvedTheme).toBe('light')
  })

  it('paints theme-color with the page colour of the theme in use', async () => {
    for (const media of ['(prefers-color-scheme: light)', '(prefers-color-scheme: dark)']) {
      const meta = document.createElement('meta')
      meta.name = 'theme-color'
      meta.media = media
      document.head.append(meta)
    }
    document.body.style.backgroundColor = 'rgb(17, 19, 23)'
    setActivePinia(createPinia())
    const { useUiStore } = await import('@/stores/ui')
    useUiStore().setTheme('dark')
    const colours = [...document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')].map((m) => m.content)
    expect(colours).toEqual(['rgb(17, 19, 23)', 'rgb(17, 19, 23)'])
  })
})
