import { computed, ref } from 'vue'
import { readPrefs, writePrefs } from '@/services/prefs'
import es from './es'
import en from './en'

export type Locale = 'es' | 'en'
export type Messages = typeof es

const dictionaries: Record<Locale, Messages> = { es, en }

const current = ref<Locale>(readPrefs().uiLanguage)

/**
 * Deliberately hand-rolled instead of vue-i18n: two locales, flat interpolation
 * and no plural rules do not justify the dependency. `en.ts` is typed as
 * `typeof es`, so a missing key is a compile error rather than a runtime blank.
 */
export function useI18n() {
  const locale = computed<Locale>({
    get: () => current.value,
    set: (value) => setLocale(value),
  })

  function t(path: string, params?: Record<string, string | number>): string {
    const raw = resolve(dictionaries[current.value], path) ?? resolve(dictionaries.es, path) ?? path
    if (typeof raw !== 'string') return path
    return params
      ? raw.replace(/\{(\w+)\}/g, (m, key) => (key in params ? String(params[key]) : m))
      : raw
  }

  return { t, locale, setLocale, availableLocales: ['es', 'en'] as Locale[] }
}

export function setLocale(value: Locale) {
  current.value = value
  writePrefs({ uiLanguage: value })
  document.documentElement.lang = value
}

function resolve(obj: unknown, path: string): unknown {
  return path.split('.').reduce<any>((acc, key) => (acc == null ? acc : acc[key]), obj)
}

/** Locale-aware date formatting for the document list. */
export function formatDate(iso: string, locale: Locale = current.value): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}
