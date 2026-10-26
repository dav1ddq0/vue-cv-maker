import { computed, ref } from 'vue'
import { readPrefs, writePrefs } from '@/services/prefs'
import es from './es'
import en from './en'

export type Locale = 'es' | 'en'
export type Messages = typeof es

/** Each UI language named in itself, so it reads right whatever the current UI language (spec 027). */
export const LOCALE_NAMES: Record<Locale, string> = { es: 'Español', en: 'English' }

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

/** "2022-03" → "mar 2022" in the UI language; anything else is returned as typed. */
export function formatMonth(value: string, locale: Locale = current.value): string {
  const match = /^(\d{4})-(\d{2})$/.exec(value)
  if (!match) return value
  const date = new Date(Number(match[1]), Number(match[2]) - 1, 1)
  return new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }).format(date)
}
