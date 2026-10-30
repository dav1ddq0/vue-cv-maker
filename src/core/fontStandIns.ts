/**
 * The bundled, metric-compatible face that stands in, in the PDF download, for a system font the
 * page cannot read: the PDF cannot embed Georgia or Arial, but it can draw Gelasio or Arimo, which
 * set the same widths (spec 050). Lower-case family names, as `familyNames` gives them.
 */
export const FONT_STAND_INS: Record<string, string> = {
  georgia: 'gelasio',
  'iowan old style': 'gelasio',
  'times new roman': 'tinos',
  times: 'tinos',
  arial: 'arimo',
  helvetica: 'arimo',
  'helvetica neue': 'arimo',
}

/** The font stack with each of those names followed by its stand-in, so a bundled face can be found for it. */
export function withStandIns(stack: string[]): string[] {
  return stack.flatMap((name) => (FONT_STAND_INS[name] ? [name, FONT_STAND_INS[name]!] : [name]))
}
