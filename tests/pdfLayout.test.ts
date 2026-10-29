import { describe, expect, it } from 'vitest'
import { groupIntoLines, joinFragments, readingOrder, repairSpaces, type ExtractedLine } from '@/services/pdfImport/layout'

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
  const side: Record<number, string> = { 1: 'COMPETENCIAS', 6: 'IDIOMAS' }
  const main: Record<number, string> = { 1: 'EXPERIENCIA', 7: 'FORMACIÓN' }
  const page = () => [
    ...Array.from({ length: 12 }, (_, i) => cell(side[i] ?? `side ${i}`, 32, 700 - i * 14, { end: 120 })),
    ...Array.from({ length: 12 }, (_, i) => cell(main[i] ?? `main ${i}`, 230, 713 - i * 13, { end: 500, fontSize: i === 0 ? 22 : 10 })),
  ]

  it('reads each column on its own, the one with the largest type (the name) first', () => {
    const order = texts(readingOrder(page()))
    expect(order.slice(0, 12)).toEqual(Array.from({ length: 12 }, (_, i) => main[i] ?? `main ${i}`))
    expect(order.slice(12)).toEqual(Array.from({ length: 12 }, (_, i) => side[i] ?? `side ${i}`))
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
      cell('IDIOMAS', 32, 733, { end: 120 }),
      ...Array.from({ length: 5 }, (_, i) => cell(`left ${i}`, 32, 719 - i * 14, { end: 120 })),
      cell('EXPERIENCIA', 230, 733, { end: 500 }),
      ...Array.from({ length: 5 }, (_, i) => cell(`right ${i}`, 230, 721 - i * 12, { end: 500 })),
    ]
    expect(texts(readingOrder(rows))).toEqual(['NAME ACROSS THE PAGE', 'IDIOMAS', ...Array.from({ length: 5 }, (_, i) => `left ${i}`), 'EXPERIENCIA', ...Array.from({ length: 5 }, (_, i) => `right ${i}`)])
  })

  it('leaves a short page alone', () => {
    const few = [cell('b', 230, 700), cell('a', 32, 700)]
    expect(texts(readingOrder(few))).toEqual(['a', 'b'])
  })
})

describe('readingOrder, labels and values (spec 040)', () => {
  it('reads a column that holds nearly all the headings, beside one that holds a stray word, top to bottom', () => {
    const rows = [
      ...Array.from({ length: 8 }, (_, i) => cell(['PERFIL', 'EXPERIENCIA', 'FORMACIÓN', 'COMPETENCIAS', 'IDIOMAS', 'CONTACTO', 'PROYECTOS', 'CHARLAS'][i]!, 32, 760 - i * 14, { end: 120, fontSize: 15 })),
      ...Array.from({ length: 8 }, (_, i) => cell(i === 3 ? 'Experiencia.' : `detail ${i}`, 205, 751 - i * 13, { end: 480 })),
    ]
    expect(texts(readingOrder(rows))[1]).toBe('detail 0')
  })
})

describe('readingOrder, two headings side by side (spec 040)', () => {
  it('reads a band of two columns that each hold one heading, set on one row', () => {
    const text = (i: number) => cell(`long wide line number ${i} of the summary text`, 45, 800 - i * 14, { end: 312 })
    const rows = [
      ...Array.from({ length: 5 }, (_, i) => text(i)),
      cell('COMPETENCIAS', 45, 700, { end: 130 }),
      cell('IDIOMAS', 305, 700, { end: 360 }),
      ...Array.from({ length: 4 }, (_, i) => cell(`skill ${i}`, 45, 680 - i * 16, { end: 140 })),
      ...Array.from({ length: 4 }, (_, i) => cell(`language ${i}`, 305, 676 - i * 14, { end: 380 })),
    ]
    const order = texts(readingOrder(rows))
    expect(order.slice(5)).toEqual(['COMPETENCIAS', 'skill 0', 'skill 1', 'skill 2', 'skill 3', 'IDIOMAS', 'language 0', 'language 1', 'language 2', 'language 3'])
  })
})

describe('readingOrder, columns above full-width text (spec 040)', () => {
  it('reads the columns of the top band, then the lines that cross them', () => {
    const rows = [
      cell('COMPETENCIAS', 45, 800, { end: 130 }),
      cell('IDIOMAS', 305, 800, { end: 360 }),
      ...Array.from({ length: 4 }, (_, i) => cell(`skill ${i}`, 45, 780 - i * 16, { end: 140 })),
      ...Array.from({ length: 4 }, (_, i) => cell(`language ${i}`, 305, 776 - i * 14, { end: 380 })),
      ...Array.from({ length: 4 }, (_, i) => cell(`summary ${i} that crosses the page`, 45, 680 - i * 14, { end: 312 })),
    ]
    expect(texts(readingOrder(rows))).toEqual([
      'COMPETENCIAS', 'skill 0', 'skill 1', 'skill 2', 'skill 3',
      'IDIOMAS', 'language 0', 'language 1', 'language 2', 'language 3',
      'summary 0 that crosses the page', 'summary 1 that crosses the page', 'summary 2 that crosses the page', 'summary 3 that crosses the page',
    ])
  })
})

describe('repairSpaces (spec 040)', () => {
  const item = (str: string) => ({ str, transform: [10, 0, 0, 10, 40, 700], width: str.length * 5, height: 10, fontName: 'f1', dir: 'ltr', hasEOL: false }) as never
  const strs = (items: Array<{ str?: string }>) => items.map((it) => it.str)

  it('takes the text of a letter-spaced item from the glyphs the page draws, with its real spaces', () => {
    const fixed = repairSpaces([item('I ng e ni e r a de da t os · “ca l i da d”')], 'Ingeniera de datos · “calidad”')
    expect(strs(fixed)).toEqual(['Ingeniera de datos · “calidad”'])
  })

  it('removes the space pdf.js puts after a lone consonant in a word that is not letter-spaced as a whole', () => {
    expect(strs(repairSpaces([item('d atos')], 'datos'))).toEqual(['datos'])
  })

  it('leaves an item with ordinary words as pdf.js gave it, since a gap drawn as a margin has no glyph', () => {
    expect(strs(repairSpaces([item('Español (Nativo) · Inglés (C1)')], 'Español (Nativo)·Inglés (C1)'))).toEqual(['Español (Nativo) · Inglés (C1)'])
  })

  it('marks letter-spaced items so a gap next to them is read as a letter gap', () => {
    const [letters, words] = repairSpaces([item('U C J A'), item('Estudio Nube')], 'UCJAEstudioNube') as Array<{ tracked?: boolean }>
    expect(letters!.tracked).toBe(true)
    expect(words!.tracked).toBeUndefined()
  })

  it('finds each item where the last one ended, and skips one the stream does not hold', () => {
    const fixed = repairSpaces([item('A B C'), item('hidden text not drawn at all'), item('P Q R S T U V W')], 'ABC PQRSTUVW')
    expect(strs(fixed)).toEqual(['ABC', 'hidden text not drawn at all', 'PQRSTUVW'])
  })

  it('looks a long item up further on when glyphs the items do not hold came before it', () => {
    const fixed = repairSpaces([item('A B C'), item('P Q R S T U V W')], 'ABC watermark PQRSTUVW')
    expect(strs(fixed)).toEqual(['ABC', 'PQRSTUVW'])
    expect(strs(repairSpaces([item('A B C'), item('P Q')], 'ABC watermark PQ'))).toEqual(['ABC', 'P Q'])
  })

  it('leaves everything alone when the page has no readable glyphs', () => {
    expect(strs(repairSpaces([item('U C J A')], ''))).toEqual(['U C J A'])
  })
})

describe('joinFragments next to letter-spaced text (spec 040)', () => {
  it('reads a gap of a letter and a half as one between letters, and a wider one as a word space', () => {
    const f = (text: string, x: number, tracked?: boolean) => ({ x, end: x + text.length * 5, text, fontSize: 10, tracked })
    expect(joinFragments([f('Ł', 0), f('UCJA', 6.4, true)])).toBe('ŁUCJA')
    expect(joinFragments([f('UCJA', 0, true), f('ØSTER', 24.8, true)])).toBe('UCJA ØSTER')
    expect(joinFragments([f('Ł', 0), f('ucja', 6.4)])).toBe('Ł ucja')
  })
})
