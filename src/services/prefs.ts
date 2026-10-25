/**
 * `localStorage` is reserved for trivial UI preferences (spec §8.1). CVs never
 * go here: it is synchronous, capped at ~5 MB per origin and throws when full.
 */
import type { ThemeChoice } from '@/core/theme'

const KEY = 'cv-maker:prefs'

export interface Prefs {
  uiLanguage: 'es' | 'en'
  lastTemplateId: string
  lastCvId: string | null
  theme: ThemeChoice
  dismissedNotices: string[]
}

const DEFAULTS: Prefs = {
  uiLanguage: 'es',
  lastTemplateId: 'classic',
  lastCvId: null,
  theme: 'light',
  dismissedNotices: [],
}

export function readPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS }
  } catch {
    return { ...DEFAULTS }
  }
}

export function writePrefs(patch: Partial<Prefs>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...readPrefs(), ...patch }))
  } catch {
    // Preferences are disposable — a full or blocked localStorage is not an error
    // worth bothering the user about.
  }
}
