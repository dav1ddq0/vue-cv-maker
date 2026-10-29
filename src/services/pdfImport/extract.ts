import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import type { TextItem } from 'pdfjs-dist/types/src/display/api'
import { groupIntoLines, type ExtractedLine } from './layout'

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
    title,
  }
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
