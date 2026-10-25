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
    expect(JSON.parse(localStorage.getItem('cv-maker:prefs')!).theme).toBe('system')

    listener!({ matches: true })
    expect(ui.resolvedTheme).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})
