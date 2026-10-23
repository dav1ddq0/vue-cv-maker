import { useI18n } from '@/i18n'

/**
 * Validation is advisory only (spec §5): these helpers return a *warning* string,
 * never an error that blocks navigation. A half-typed email is a normal state in
 * a form people fill over several sittings.
 */
export function useValidation() {
  const { t } = useI18n()

  function emailWarning(value: string): string | undefined {
    if (!value.trim()) return undefined
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) ? undefined : t('validation.email')
  }

  function urlWarning(value: string): string | undefined {
    if (!value.trim()) return undefined
    const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`
    try {
      const url = new URL(candidate)
      return url.hostname.includes('.') ? undefined : t('validation.url')
    } catch {
      return t('validation.url')
    }
  }

  /** Partial ISO dates compare correctly as strings ("2021" < "2021-03" < "2022"). */
  function dateOrderWarning(start: string, end: string | null): string | undefined {
    if (!start || !end) return undefined
    return end < start ? t('validation.dateOrder') : undefined
  }

  return { emailWarning, urlWarning, dateOrderWarning }
}
