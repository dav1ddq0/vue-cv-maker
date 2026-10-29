import { describe, expect, it } from 'vitest'
import { groupIntoLines, readingOrder, type ExtractedLine } from '@/services/pdfImport/layout'

/** A pdf.js text item at (x, y), `width` wide, in `size` type. */
const item = (str: string, x: number, y: number, width: number, size = 10) =>
  ({ str, transform: [size, 0, 0, size, x, y], width, height: size, fontName: 'f1', dir: 'ltr', hasEOL: false }) as never

const cell = (text: string, x: number, y: number, extra: Partial<ExtractedLine> = {}): ExtractedLine => ({
  page: 1, y, x, end: x + text.length * 5, text, fontSize: 10, fontName: 'f1', bold: false, ...extra,
})
const texts = (lines: ExtractedLine[]) => lines.map((line) => line.text)

describe('groupIntoLines (spec 040)', () => {
  it('splits a line at a wide gap, so a sidebar and a main column are not one line', () => {
    const lines = groupIntoLines([item('Idiomas', 32, 400, 40), item('Formación', 230, 400, 50)], 1)
    expect(texts(lines)).toEqual(['Idiomas', 'Formación'])
    expect(lines.map((line) => line.end)).toEqual([72, 280])
  })

  it('keeps the words of one line, and an item list, together', () => {
    const lines = groupIntoLines([item('Cartograf', 45, 600, 45), item('·', 96, 600, 4), item('Remoto', 106, 600, 30)], 1)
    expect(texts(lines)).toEqual(['Cartograf · Remoto'])
  })
})

describe('readingOrder (spec 040)', () => {
  /** A sidebar at x 32–120 and a main column at x 230–500, twelve lines each, like Meridian. */
  const page = () => [
    ...Array.from({ length: 12 }, (_, i) => cell(`side ${i}`, 32, 700 - i * 14, { end: 120 })),
    ...Array.from({ length: 12 }, (_, i) => cell(`main ${i}`, 230, 710 - i * 14, { end: 500, fontSize: i === 0 ? 22 : 10 })),
  ]

  it('reads each column on its own, the one with the largest type (the name) first', () => {
    const order = texts(readingOrder(page()))
    expect(order.slice(0, 12)).toEqual(Array.from({ length: 12 }, (_, i) => `main ${i}`))
    expect(order.slice(12)).toEqual(Array.from({ length: 12 }, (_, i) => `side ${i}`))
  })

  it('does not read the ragged right edge of a column as a gutter', () => {
    const single = Array.from({ length: 14 }, (_, i) => cell(`line ${i}`, 45, 700 - i * 14, { end: i % 3 ? 300 : 520 }))
    expect(texts(readingOrder(single))).toEqual(single.map((line) => line.text))
  })

  it('leaves a label column (a heading per section, one line each) in plain top to bottom order', () => {
    const rows = [
      cell('EXPERIENCIA', 45, 700, { end: 110 }),
      ...Array.from({ length: 6 }, (_, i) => cell(`entry ${i}`, 171, 700 - i * 14, { end: 500 })),
      cell('FORMACIÓN', 45, 560, { end: 110 }),
      ...Array.from({ length: 4 }, (_, i) => cell(`study ${i}`, 171, 560 - i * 14, { end: 500 })),
    ]
    expect(texts(readingOrder(rows)).slice(0, 2)).toEqual(['EXPERIENCIA', 'entry 0'])
    expect(texts(readingOrder(rows)).indexOf('FORMACIÓN')).toBeLessThan(texts(readingOrder(rows)).indexOf('study 0'))
  })

  it('lets a header that crosses the gutter divide the page into bands', () => {
    const rows = [
      cell('NAME ACROSS THE PAGE', 32, 780, { end: 500, fontSize: 24 }),
      ...Array.from({ length: 6 }, (_, i) => cell(`left ${i}`, 32, 740 - i * 14, { end: 120 })),
      ...Array.from({ length: 6 }, (_, i) => cell(`right ${i}`, 230, 740 - i * 14, { end: 500 })),
    ]
    expect(texts(readingOrder(rows))).toEqual(['NAME ACROSS THE PAGE', ...Array.from({ length: 6 }, (_, i) => `left ${i}`), ...Array.from({ length: 6 }, (_, i) => `right ${i}`)])
  })

  it('leaves a short page alone', () => {
    const few = [cell('b', 230, 700), cell('a', 32, 700)]
    expect(texts(readingOrder(few))).toEqual(['a', 'b'])
  })
})
