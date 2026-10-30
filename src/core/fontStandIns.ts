/**
 * The bundled, metric-compatible face that stands in, in the PDF download, for a system font the
 * page cannot read: the PDF cannot embed Georgia or Arial, but it can draw Gelasio or Arimo, which
 * set the same widths (spec 050); Palatino, Tahoma and Verdana get the nearest bundled face (spec 051). Lower-case family names, as `familyNames` gives them.
 */
export const FONT_STAND_INS: Record<string, string> = {
  georgia: 'gelasio',
  'iowan old style': 'gelasio',
  'times new roman': 'tinos',
  times: 'tinos',
  arial: 'arimo',
  helvetica: 'arimo',
  'helvetica neue': 'arimo',
  // Palatino is wider than Times: Gelasio, set to Georgia's widths, is the nearest bundled serif.
  'palatino linotype': 'gelasio',
  palatino: 'gelasio',
  'book antiqua': 'gelasio',
  // DejaVu Sans is the wide humanist sans that stands in for both.
  tahoma: 'dejavu sans',
  verdana: 'dejavu sans',
}

/** The font stack with each of those names followed by its stand-in, so a bundled face can be found for it. */
export function withStandIns(stack: string[]): string[] {
  return stack.flatMap((name) => (FONT_STAND_INS[name] ? [name, FONT_STAND_INS[name]!] : [name]))
}

/** How each stand-in is spelled in a `font-family` list. */
const CSS_NAMES: Record<string, string> = {
  gelasio: "'Gelasio'",
  tinos: "'Tinos'",
  arimo: "'Arimo'",
  'dejavu sans': "'DejaVu Sans'",
}

/**
 * A CSS `font-family` list with each stand-in right after the system font it stands for:
 * `Georgia, 'Times New Roman', serif` → `Georgia, 'Gelasio', 'Times New Roman', 'Tinos', serif`.
 * A computer that has Georgia shows Georgia; one that has not shows the same face the PDF download
 * uses, so the page and the PDF agree everywhere (spec 052). A stand-in already in the list is not repeated.
 */
export function fontStackWithStandIns(stack: string): string {
  const names = stack.split(',').map((part) => part.trim()).filter(Boolean)
  const present = new Set(names.map((name) => name.replace(/^['"]|['"]$/g, '').toLowerCase()))
  return names
    .flatMap((name) => {
      const standIn = FONT_STAND_INS[name.replace(/^['"]|['"]$/g, '').toLowerCase()]
      if (!standIn || present.has(standIn)) return [name]
      present.add(standIn)
      return [name, CSS_NAMES[standIn]!]
    })
    .join(', ')
}
