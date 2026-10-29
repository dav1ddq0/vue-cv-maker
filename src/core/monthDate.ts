/**
 * The partial dates the CV stores (`''`, `YYYY` or `YYYY-MM`) taken apart and put together again for
 * the month and year fields (spec 038). Pure, so the rules live here and not in the component.
 */

/** Years outside this range are typos, not dates of a career. */
export const MIN_YEAR = 1900
export const MAX_YEAR = 2100

/** The year and month of a stored value; whatever is not one of its two shapes is nothing. */
export function splitMonth(value: string): { year: string; month: string } {
  const match = /^(\d{4})(?:-(\d{2}))?$/.exec(value)
  return { year: match?.[1] ?? '', month: match?.[2] ?? '' }
}

/** Four digits that make a year within `MIN_YEAR`–`MAX_YEAR`. */
export function isPlausibleYear(year: string): boolean {
  return /^\d{4}$/.test(year) && Number(year) >= MIN_YEAR && Number(year) <= MAX_YEAR
}

/** The value to store: a month without a plausible year stores nothing, a year alone is stored as is. */
export function joinMonth(year: string, month: string): string {
  if (!isPlausibleYear(year)) return ''
  return month ? `${year}-${month}` : year
}
