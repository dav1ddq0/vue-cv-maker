/**
 * Curated choices offered by the style step. Kept as data (no Vue, no store) so
 * they can be unit-tested and reused.
 */

/** Suggested accent colours; the free colour input stays available next to them. */
export const PALETTE = ['#ffd86f', '#7c55e4', '#f2614c', '#10cf65', '#334fdc'] as const

export function isSameColor(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}
