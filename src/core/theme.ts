/** What the user picked; `system` follows the operating system (spec 019). */
export type ThemeChoice = 'light' | 'dark' | 'system'
export type Theme = 'light' | 'dark'

export const DARK_QUERY = '(prefers-color-scheme: dark)'

/** Anything unknown (an old or hand-edited preference) reads as light, the default. */
export function resolveTheme(choice: ThemeChoice, systemDark: boolean): Theme {
  if (choice === 'system') return systemDark ? 'dark' : 'light'
  return choice === 'dark' ? 'dark' : 'light'
}

export function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(DARK_QUERY).matches
}
