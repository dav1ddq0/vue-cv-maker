/**
 * Curated choices offered by the style step. Kept as data (no Vue, no store) so
 * they can be unit-tested and reused.
 */

/** Suggested accent colours; the free colour input stays available next to them. */
export const PALETTE = ['#ffd86f', '#7c55e4', '#f2614c', '#10cf65', '#334fdc'] as const

export function isSameColor(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

export interface FontOption {
  id: string
  label: string
  /** CSS `font-family` stack. System fonts only, each ending in a generic family. */
  value: string
}

/**
 * Fonts that resolve without downloading anything (local-first, no font package).
 * The first four keep the exact values the select used before, so documents that
 * already store them keep matching an option; the Iowan stack is the editorial
 * template's own default and must be listed or the select would render blank.
 */
export const FONT_OPTIONS: FontOption[] = [
  { id: 'sourceSans', label: 'Source Sans', value: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif" },
  { id: 'inter', label: 'Inter', value: "'Inter', system-ui, -apple-system, sans-serif" },
  { id: 'georgia', label: 'Georgia', value: "Georgia, 'Times New Roman', serif" },
  { id: 'jetbrainsMono', label: 'JetBrains Mono', value: "'JetBrains Mono', 'SFMono-Regular', Consolas, monospace" },
  { id: 'iowan', label: 'Iowan Old Style', value: "'Iowan Old Style', Georgia, 'Times New Roman', serif" },
  { id: 'calibri', label: 'Calibri', value: "Calibri, Carlito, 'Segoe UI', system-ui, sans-serif" },
  { id: 'cambria', label: 'Cambria', value: "Cambria, Caladea, Georgia, serif" },
  { id: 'helvetica', label: 'Helvetica', value: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
  { id: 'arial', label: 'Arial', value: "Arial, 'Liberation Sans', Helvetica, sans-serif" },
  { id: 'timesNewRoman', label: 'Times New Roman', value: "'Times New Roman', Times, 'Liberation Serif', serif" },
  { id: 'garamond', label: 'Garamond', value: "Garamond, 'EB Garamond', 'Times New Roman', serif" },
  { id: 'palatino', label: 'Palatino', value: "'Palatino Linotype', Palatino, 'Book Antiqua', serif" },
  { id: 'tahoma', label: 'Tahoma', value: "Tahoma, 'DejaVu Sans', Verdana, sans-serif" },
  { id: 'verdana', label: 'Verdana', value: "Verdana, 'DejaVu Sans', Geneva, sans-serif" },
]

export interface CvLanguageOption {
  code: string
  /** Written in its own language so it stays readable whatever the UI language is. */
  label: string
}

/** Languages the templates have month names, section titles and level labels for. */
export const CV_LANGUAGES: CvLanguageOption[] = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
]
