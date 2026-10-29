import type { TextItem } from 'pdfjs-dist/types/src/display/api'

/** One reconstructed visual line (a cell of one: see `CELL_GAP`), with the style signals the heuristics need. */
export interface ExtractedLine {
  page: number
  /** Distance from the top of the page, in PDF units. */
  y: number
  x: number
  /** Where the last glyph ends; with `x` it is the line's extent across the page (spec 040). */
  end: number
  text: string
  fontSize: number
  fontName: string
  bold: boolean
}

/** A positioned piece of a line, as pdf.js hands it back. */
export interface TextFragment {
  x: number
  /** Where the fragment's last glyph ends. */
  end: number
  text: string
  fontSize: number
  fontName?: string
}

/** Fragments whose baselines differ by less than this are the same line. */
const Y_TOLERANCE = 2.5

/**
 * A gap wider than this share of the font size between two fragments of a line is a word space.
 * Measured on the app's own PDFs (spec 037): fragments that touch (a letter from another font
 * file, an e-mail split at its break points) sit within ±0.03 em; word spaces are 0.17 em or more.
 */
const WORD_GAP = 0.1

/**
 * A gap wider than this many font sizes ends a cell: the text on the other side is a different
 * column or a label and its value, not the next words of the line (spec 040). Word spaces and the
 * " · " between items measure well under one em.
 */
const CELL_GAP = 2

/** The narrowest strip of the page that no text crosses and that still counts as a gutter, in PDF units. */
const GUTTER_MIN = 12

/**
 * Headers do not count when looking for a gutter: a cell wider than this share of the text, or set
 * this many times larger than the usual type, may cross it. Everything else may not, or the ragged
 * right edge of a column would read as a gutter.
 */
const HEADER_WIDTH = 0.8
const HEADER_SIZE = 1.35

/** A column needs this many cells, mostly in runs of lines this close, to be text that flows. */
const FLOW_MIN_CELLS = 3
const FLOW_LINE_GAP = 2.4

/**
 * pdf.js hands back positioned fragments, not lines. Fragments at the same height are one line,
 * which a wide gap splits into cells; `readingOrder` then puts the cells of a page in the order a
 * person reads them, column by column where the page has columns.
 */
export function groupIntoLines(items: TextItem[], page: number): ExtractedLine[] {
  const buckets: { y: number; fragments: TextFragment[] }[] = []

  for (const item of items) {
    if (!('str' in item) || !item.str.trim()) continue
    const [, , , scaleY, x, y] = item.transform as number[]
    const fragment = { x, end: x + (item.width || 0), text: item.str, fontSize: Math.abs(scaleY) || 0, fontName: String(item.fontName ?? '') }
    const bucket = buckets.find((candidate) => Math.abs(candidate.y - y) <= Y_TOLERANCE)
    if (bucket) bucket.fragments.push(fragment)
    else buckets.push({ y, fragments: [fragment] })
  }

  const lines = buckets.flatMap(({ y, fragments }) =>
    splitIntoCells(fragments).map((cell) => {
      const first = cell[0]!
      return {
        page,
        y,
        x: Math.min(...cell.map((f) => f.x)),
        end: Math.max(...cell.map((f) => f.end)),
        text: collapseLetterSpacing(joinFragments(cell).replace(/\s+/g, ' ').trim()),
        fontSize: Math.max(...cell.map((f) => f.fontSize)),
        fontName: first.fontName ?? '',
        bold: cell.some((f) => isBold(f.fontName ?? '')),
      }
    }),
  )
  return readingOrder(lines.filter((line) => line.text.length > 0))
}

/** The fragments of one line, left to right, cut wherever the gap is wider than `CELL_GAP`. */
function splitIntoCells(fragments: TextFragment[]): TextFragment[][] {
  const cells: TextFragment[][] = []
  let end = -Infinity
  for (const fragment of [...fragments].sort((a, b) => a.x - b.x)) {
    if (!cells.length || fragment.x - end > CELL_GAP * fragment.fontSize) cells.push([])
    cells.at(-1)!.push(fragment)
    end = Math.max(end, fragment.end)
  }
  return cells
}

/**
 * The cells of one page in reading order. PDF y grows upward, so descending y is top to bottom.
 * Where the page has two or more columns of flowing text, each column is read on its own, the one
 * with the largest type (the name) first, and a cell that crosses a gutter (a header) ends the band
 * of columns above it. Otherwise it is plain top to bottom, left to right.
 */
export function readingOrder(cells: ExtractedLine[]): ExtractedLine[] {
  const topToBottom = [...cells].sort((a, b) => b.y - a.y || a.x - b.x)
  if (topToBottom.length < 8) return topToBottom
  const gutters = findGutters(topToBottom)
  if (!gutters.length) return topToBottom

  const crosses = (cell: ExtractedLine) => gutters.some((g) => cell.x < g.end && cell.end > g.start)
  const columnOf = (cell: ExtractedLine) => gutters.filter((g) => cell.x >= g.end).length
  const columns = Array.from({ length: gutters.length + 1 }, (_, index) => topToBottom.filter((cell) => !crosses(cell) && columnOf(cell) === index))
  const flowing = columns.map((column, index) => (flows(column) ? index : -1)).filter((index) => index >= 0)
  if (flowing.length < 2) return topToBottom

  // A column of labels or dates reads with the flowing column nearest to it.
  const target = (index: number) => flowing.reduce((best, candidate) => (Math.abs(candidate - index) < Math.abs(best - index) ? candidate : best))
  const largest = topToBottom.filter((cell) => !crosses(cell)).reduce((best, cell) => (cell.fontSize > best.fontSize ? cell : best))
  const first = target(columnOf(largest))
  const order = [first, ...flowing.filter((index) => index !== first)]

  const out: ExtractedLine[] = []
  let band = new Map<number, ExtractedLine[]>(order.map((index) => [index, []]))
  const flush = () => {
    for (const index of order) out.push(...band.get(index)!)
    band = new Map(order.map((index) => [index, []]))
  }
  for (const cell of topToBottom) {
    if (crosses(cell)) {
      flush()
      out.push(cell)
    } else band.get(target(columnOf(cell)))!.push(cell)
  }
  flush()
  return out
}

/** The vertical strips, inside the text, that no cell but a header crosses. */
function findGutters(cells: ExtractedLine[]): Array<{ start: number; end: number }> {
  const left = Math.min(...cells.map((c) => c.x))
  const right = Math.max(...cells.map((c) => c.end))
  const sizes = cells.map((c) => c.fontSize).sort((a, b) => a - b)
  const usualSize = sizes[Math.floor(sizes.length / 2)]!
  const body = cells
    .filter((c) => c.end - c.x <= HEADER_WIDTH * (right - left) && c.fontSize <= HEADER_SIZE * usualSize)
    .sort((a, b) => a.x - b.x)

  // The stretches of the page that body text covers, merged; the wide gaps between them are gutters.
  const gutters: Array<{ start: number; end: number }> = []
  let covered = body[0]?.end ?? 0
  for (const cell of body) {
    if (cell.x - covered >= GUTTER_MIN) gutters.push({ start: covered, end: cell.x })
    covered = Math.max(covered, cell.end)
  }
  return gutters
}

/** Text that flows: several cells, most of them a line or two below the one above. */
function flows(column: ExtractedLine[]): boolean {
  if (column.length < FLOW_MIN_CELLS) return false
  const close = column.slice(1).filter((cell, i) => column[i]!.y - cell.y <= FLOW_LINE_GAP * Math.max(cell.fontSize, column[i]!.fontSize)).length
  return close >= 2 && close / (column.length - 1) >= 0.5
}

/**
 * Joins a line's fragments left to right, with a space only where there is a gap between two.
 * A PDF draws a word in several pieces when part of it comes from another font file (a "Ł",
 * an "ř") or when it was laid out with break points (an e-mail address); those pieces touch.
 */
export function joinFragments(fragments: TextFragment[]): string {
  let text = ''
  let end = -Infinity
  for (const fragment of [...fragments].sort((a, b) => a.x - b.x)) {
    if (text && fragment.x - end > WORD_GAP * fragment.fontSize) text += ' '
    text += fragment.text
    end = Math.max(end, fragment.end)
  }
  return text
}

/**
 * Undoes CSS `letter-spacing` in the extracted text.
 *
 * A tracked-out heading reaches pdf.js as one fragment per glyph, and line
 * reconstruction joins them with spaces: "EXPERIENCIA" arrives as
 * "E X P E R I E N C I A" and no keyword heuristic recognises it. Runs of three
 * or more single-character tokens are glued back together; shorter runs are
 * left alone so real text like "Go y R" survives.
 */
export function collapseLetterSpacing(text: string): string {
  const tokens = text.split(' ')
  const out: string[] = []
  let run: string[] = []

  const flush = () => {
    if (run.length >= 3) out.push(run.join(''))
    else out.push(...run)
    run = []
  }

  for (const token of tokens) {
    if ([...token].length === 1 && /[\p{L}\p{N}]/u.test(token)) run.push(token)
    else {
      flush()
      out.push(token)
    }
  }
  flush()

  return out.join(' ').replace(/\s+/g, ' ').trim()
}

function isBold(fontName: string): boolean {
  return /bold|black|heavy|semibold|[-,]bd\b/i.test(fontName)
}
