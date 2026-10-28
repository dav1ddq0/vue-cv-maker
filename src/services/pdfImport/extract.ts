import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import type { TextItem } from 'pdfjs-dist/types/src/display/api'

// The worker is a separate chunk, loaded only when the user actually imports a PDF.
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

/** One reconstructed visual line, with the style signals the heuristics need. */
export interface ExtractedLine {
  page: number
  /** Distance from the top of the page, in PDF units. */
  y: number
  x: number
  text: string
  fontSize: number
  fontName: string
  bold: boolean
}

export interface ExtractedDocument {
  lines: ExtractedLine[]
  rawText: string
  pageCount: number
  /** A scan has no text layer — detected here so the UI can say so plainly. */
  hasTextLayer: boolean
  /** Set when text sits in two clearly separated x-bands (spec §7.3). */
  looksMultiColumn: boolean
}

/** Fragments whose baselines differ by less than this are the same line. */
const Y_TOLERANCE = 2.5

export async function extractDocument(file: File | ArrayBuffer): Promise<ExtractedDocument> {
  const source = file instanceof File ? await file.arrayBuffer() : file
  // A user's PDF is untrusted input: no eval-compiled font code, even where a CSP would allow it (spec 034).
  const doc = await pdfjs.getDocument({ data: new Uint8Array(source), isEvalSupported: false }).promise

  const lines: ExtractedLine[] = []
  try {
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
      const page = await doc.getPage(pageNumber)
      const content = await page.getTextContent()
      lines.push(...groupIntoLines(content.items as TextItem[], pageNumber))
      page.cleanup()
    }
  } finally {
    await doc.destroy()
  }

  return {
    lines,
    rawText: lines.map((l) => l.text).join('\n'),
    pageCount: doc.numPages,
    hasTextLayer: lines.some((l) => l.text.trim().length > 0),
    looksMultiColumn: detectColumns(lines),
  }
}

/**
 * pdf.js hands back positioned fragments, not lines. Grouping on the Y
 * coordinate within a tolerance rebuilds reading order for ordinary layouts;
 * it is also exactly where two-column CVs interleave, which is why the review
 * screen (spec §7.2, stage 3) is not optional.
 */
function groupIntoLines(items: TextItem[], page: number): ExtractedLine[] {
  const buckets: ExtractedLine[] = []

  for (const item of items) {
    if (!('str' in item) || !item.str.trim()) continue
    const [, , , scaleY, x, y] = item.transform as number[]
    const fontSize = Math.abs(scaleY) || 0
    const fontName = String(item.fontName ?? '')

    const existing = buckets.find((line) => Math.abs(line.y - y) <= Y_TOLERANCE)
    if (existing) {
      existing.text += needsSpace(existing.text, item.str) ? ` ${item.str}` : item.str
      existing.fontSize = Math.max(existing.fontSize, fontSize)
      existing.x = Math.min(existing.x, x)
      existing.bold ||= isBold(fontName)
    } else {
      buckets.push({ page, y, x, text: item.str, fontSize, fontName, bold: isBold(fontName) })
    }
  }

  return buckets
    // PDF y grows upward: descending y is top-to-bottom reading order.
    .sort((a, b) => b.y - a.y || a.x - b.x)
    .map((line) => ({ ...line, text: collapseLetterSpacing(line.text.replace(/\s+/g, ' ').trim()) }))
    .filter((line) => line.text.length > 0)
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

function needsSpace(left: string, right: string): boolean {
  return !/\s$/.test(left) && !/^\s/.test(right) && !/[-/(]$/.test(left)
}

function isBold(fontName: string): boolean {
  return /bold|black|heavy|semibold|[-,]bd\b/i.test(fontName)
}

/**
 * Two-column detection: if a large share of lines start well right of the page's
 * left margin while others stay left, the extraction order is unreliable.
 */
function detectColumns(lines: ExtractedLine[]): boolean {
  if (lines.length < 12) return false
  const xs = lines.map((l) => l.x)
  const min = Math.min(...xs)
  const max = Math.max(...xs)
  if (max - min < 100) return false
  const midpoint = (min + max) / 2
  const right = xs.filter((x) => x > midpoint).length
  const share = right / xs.length
  return share > 0.25 && share < 0.75
}
