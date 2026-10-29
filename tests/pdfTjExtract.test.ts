import { describe, expect, it } from 'vitest'
import * as pdfjs from 'pdfjs-dist'
import { extractDocument } from '@/services/pdfImport/extract'

/**
 * Real PDFs from a producer that draws no space glyphs: each line is one TJ array, and the words are
 * told apart only by the adjustments between the glyphs (spec 040). Written by hand so the test needs
 * no binary fixture; the standard font Helvetica is not embedded, as in many generated PDFs.
 */
function pdf(lines: string[]): ArrayBuffer {
  const stream = `BT\n/F1 12 Tf\n${lines.map((line, i) => `1 0 0 1 50 ${780 - i * 20} Tm ${line}`).join('\n')}\nET\n`
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}endstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
  ]
  let out = '%PDF-1.4\n'
  const offsets = objects.map((object, i) => {
    const at = out.length
    out += `${i + 1} 0 obj\n${object}\nendobj\n`
    return at
  })
  const xref = out.length
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return new TextEncoder().encode(out).buffer as ArrayBuffer
}

/** "Letter-spaced": every glyph 250 apart and a word 250 + 333 apart, as CSS letter-spacing is drawn. */
function tracked(text: string): string {
  const words = text.split(' ')
  const parts: string[] = []
  words.forEach((word, w) => {
    ;[...word].forEach((ch, i) => {
      parts.push(`(${ch})`)
      const endOfWord = i === word.length - 1
      if (!(endOfWord && w === words.length - 1)) parts.push(String(-(250 + (endOfWord ? 333 : 0))))
    })
  })
  return `[${parts.join('')}]TJ`
}

describe('extractDocument on a PDF that spaces its words by adjustment (spec 040)', () => {
  const lines = async (data: ArrayBuffer) => {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL('../node_modules/pdfjs-dist/build/pdf.worker.mjs', import.meta.url).pathname
    return (await extractDocument(data)).lines.map((line) => line.text)
  }

  it('finds the words of letter-spaced text that pdf.js gives as one space after every letter', async () => {
    expect(await lines(pdf([tracked('INGENIERA DE DATOS'), tracked('EXPERIENCIA LABORAL')]))).toEqual(['INGENIERA DE DATOS', 'EXPERIENCIA LABORAL'])
  })

  it('keeps the words of ordinary text spaced by glue, with kerning inside a word', async () => {
    const line = '[(Ingeniera)-333(de)-333(datos)-333(con)-333(A)120(V)-333(y)-333(T)80(o)-333(Yo)]TJ'
    expect(await lines(pdf([line]))).toEqual(['Ingeniera de datos con AV y To Yo'])
  })
})
