import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import type { TextItem } from 'pdfjs-dist/types/src/display/api'
import { groupIntoLines, repairSpaces, type ExtractedLine } from './layout'

export type { ExtractedLine } from './layout'

// The worker is a separate chunk, loaded only when the user actually imports a PDF.
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

export interface ExtractedDocument {
  lines: ExtractedLine[]
  rawText: string
  pageCount: number
  /** A scan has no text layer — detected here so the UI can say so plainly. */
  hasTextLayer: boolean
  /** Set when text sits in two clearly separated x-bands (spec §7.3). */
  looksMultiColumn: boolean
  /** The title in the PDF's own metadata, which a CV usually sets to its owner's name (spec 040). */
  title?: string
}

export async function extractDocument(file: File | ArrayBuffer): Promise<ExtractedDocument> {
  const source = file instanceof File ? await file.arrayBuffer() : file
  // A user's PDF is untrusted input: no eval-compiled font code, even where a CSP would allow it (spec 034).
  const doc = await pdfjs.getDocument({ data: new Uint8Array(source), isEvalSupported: false }).promise

  const lines: ExtractedLine[] = []
  const title = await metadataTitle(doc)
  try {
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
      const page = await doc.getPage(pageNumber)
      const content = await page.getTextContent()
      const { glyphs, boldFonts } = await drawnText(page, content.items as TextItem[])
      lines.push(...groupIntoLines(repairSpaces(content.items as TextItem[], glyphs), pageNumber, boldFonts))
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
    title,
  }
}

/** The fonts that draw text this heavy are bold; the name is the real one ("…-SemiBold"), not pdf.js's id. */
const BOLD_FONT = /bold|black|heavy/i

/**
 * What the page draws, from its operators: the glyphs in drawing order (a space where the PDF draws
 * a space glyph) and which of the fonts its text items use are bold. Both are things the text
 * content hides, and both are optional: a page whose operators cannot be read is used as it is.
 */
async function drawnText(page: pdfjs.PDFPageProxy, items: TextItem[]): Promise<{ glyphs: string; boldFonts: Set<string> }> {
  const fontIds = [...new Set(items.map((item) => ('fontName' in item ? item.fontName : '')))]
  let glyphs = ''
  const boldFonts = new Set<string>()
  try {
    const { fnArray, argsArray } = await page.getOperatorList()
    const { OPS } = pdfjs
    fnArray.forEach((op, index) => {
      if (op !== OPS.showText && op !== OPS.showSpacedText && op !== OPS.nextLineShowText && op !== OPS.nextLineSetSpacingShowText) return
      const args = argsArray[index] as unknown[]
      const shown = op === OPS.nextLineSetSpacingShowText ? args[2] : args[0]
      if (!Array.isArray(shown)) return
      for (const glyph of shown as unknown[]) {
        const unicode = (glyph as { unicode?: unknown } | null)?.unicode
        if (typeof unicode === 'string') glyphs += unicode
      }
    })
  } catch {
    glyphs = ''
  }
  for (const id of fontIds) {
    let name: unknown
    try {
      name = page.commonObjs.has(id) ? (page.commonObjs.get(id) as { name?: unknown } | null)?.name : undefined
    } catch {
      name = undefined
    }
    if (BOLD_FONT.test(typeof name === 'string' ? name : id)) boldFonts.add(id)
  }
  return { glyphs, boldFonts }
}

/** The metadata title, if the PDF has one and it is text. */
async function metadataTitle(doc: pdfjs.PDFDocumentProxy): Promise<string | undefined> {
  try {
    const { info } = await doc.getMetadata()
    const title = (info as { Title?: unknown } | undefined)?.Title
    return typeof title === 'string' && title.trim() ? title : undefined
  } catch {
    return undefined
  }
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
