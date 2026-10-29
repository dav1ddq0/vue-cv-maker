import { describe, expect, it } from 'vitest'
import type { ExtractedDocument, ExtractedLine } from '@/services/pdfImport/extract'
import { collapseLetterSpacing, joinFragments } from '@/services/pdfImport/extract'
import { analyze, parseDateRange, titleCaseIfShouting, toPartialIso } from '@/services/pdfImport/heuristics'
import { assembleCV } from '@/services/pdfImport/assemble'

/** Builds an extraction result by hand so the heuristics are testable without a PDF. */
function doc(lines: Array<Partial<ExtractedLine> & { text: string }>): ExtractedDocument {
  const full: ExtractedLine[] = lines.map((line, index) => ({
    page: 1,
    y: 800 - index * 14,
    x: 50,
    fontSize: 10,
    fontName: 'Helvetica',
    bold: false,
    ...line,
  }))
  return {
    lines: full,
    rawText: full.map((l) => l.text).join('\n'),
    pageCount: 1,
    hasTextLayer: true,
    looksMultiColumn: false,
  }
}

const SPANISH_CV = doc([
  { text: 'NADIA MARTÍN REYES', fontSize: 22, bold: true },
  { text: 'Desarrolladora Full-Stack', fontSize: 12 },
  { text: 'nadia.martin@example.com · +34 600 123 456' },
  { text: 'Valencia, España' },
  { text: 'linkedin.com/in/nadiamartin' },
  { text: 'EXPERIENCIA', fontSize: 13, bold: true },
  { text: 'Desarrolladora Senior — Cartograf 2022 - actualidad' },
  { text: '• Reduje el tiempo de carga de 4,2 s a 1,1 s.' },
  { text: 'Desarrolladora Full-Stack — Estudio Nube sep 2019 - feb 2022' },
  { text: '• Construí el sistema de diseño compartido.' },
  { text: 'FORMACIÓN', fontSize: 13, bold: true },
  { text: 'Grado en Informática — UPV 2014 - 2018' },
  { text: 'HABILIDADES', fontSize: 13, bold: true },
  { text: 'Lenguajes: TypeScript, Python, Go' },
  { text: 'IDIOMAS', fontSize: 13, bold: true },
  { text: 'Inglés — C1' },
])

describe('parseDateRange', () => {
  it.each([
    ['2020 - 2023', { start: '2020', end: '2023' }],
    ['Mar 2021 – present', { start: '2021-03', end: null }],
    ['sep 2019 - feb 2022', { start: '2019-09', end: '2022-02' }],
    ['03/2019 a 06/2021', { start: '2019-03', end: '2021-06' }],
    ['2022 - actualidad', { start: '2022', end: null }],
  ])('parses %s', (input, expected) => {
    expect(parseDateRange(input)).toEqual(expected)
  })

  it('returns null when there is no range', () => {
    expect(parseDateRange('Desarrolladora Senior')).toBeNull()
  })
})

describe('toPartialIso', () => {
  it('keeps a bare year as a year', () => {
    expect(toPartialIso('2018')).toBe('2018')
  })

  it('maps month names in both languages', () => {
    expect(toPartialIso('ene 2020')).toBe('2020-01')
    expect(toPartialIso('Jan 2020')).toBe('2020-01')
  })
})

describe('analyze', () => {
  const draft = analyze(SPANISH_CV)

  it('picks the largest first-page text as the name', () => {
    expect(draft.fullName.value).toBe('Nadia Martín Reyes')
    expect(draft.fullName.confidence).toBe('high')
  })

  it('extracts direct fields by regex', () => {
    expect(draft.email.value).toBe('nadia.martin@example.com')
    expect(draft.phone.value).toContain('600')
    expect(draft.links).toContainEqual({ label: 'LinkedIn', url: 'linkedin.com/in/nadiamartin' })
  })

  it('finds every known section header', () => {
    expect(draft.sections.map((s) => s.kind)).toEqual([
      'experience',
      'education',
      'skills',
      'languages',
    ])
  })

  it('flags an extraction with no detectable name', () => {
    const anonymous = analyze(doc([{ text: 'algo suelto' }, { text: 'otra linea' }]))
    expect(anonymous.warnings).toContain('noSections')
  })
})

describe('assembleCV', () => {
  const cv = assembleCV(analyze(SPANISH_CV))

  it('splits experience into entries at each date range', () => {
    expect(cv.experience).toHaveLength(2)
    expect(cv.experience[0]).toMatchObject({
      position: 'Desarrolladora Senior',
      company: 'Cartograf',
      startDate: '2022',
      endDate: null,
    })
    expect(cv.experience[1].endDate).toBe('2022-02')
  })

  it('turns bulleted lines into highlights', () => {
    expect(cv.experience[0].highlights).toEqual(['Reduje el tiempo de carga de 4,2 s a 1,1 s.'])
  })

  it('reads "Category: a, b" as a skill group', () => {
    expect(cv.skills[0]).toMatchObject({
      category: 'Lenguajes',
      items: [{ name: 'TypeScript' }, { name: 'Python' }, { name: 'Go' }],
    })
  })

  it('splits a language from its level', () => {
    expect(cv.languages[0]).toMatchObject({ name: 'Inglés', level: 'C1' })
  })

  it('produces a sectionOrder covering every section it created', () => {
    expect(cv.sectionOrder).toEqual(
      expect.arrayContaining(['experience', 'education', 'skills', 'languages']),
    )
  })

  it('discards unclassified blocks unless the reviewer assigns them', () => {
    const withBlock = analyze(
      doc([
        { text: 'Ada Lovelace', fontSize: 20, bold: true },
        { text: 'PREMIOS', fontSize: 13, bold: true },
        { text: 'Medalla de plata 2019' },
      ]),
    )
    expect(withBlock.unclassified.length).toBeGreaterThan(0)

    const blockId = withBlock.unclassified.at(-1)!.id
    expect(assembleCV(withBlock).customSections).toHaveLength(0)
    expect(assembleCV(withBlock, { blocks: { [blockId]: 'custom' } }).customSections).toHaveLength(1)
  })
})

describe('titleCaseIfShouting', () => {
  it('only rewrites all-caps text', () => {
    expect(titleCaseIfShouting('NADIA MARTÍN')).toBe('Nadia Martín')
    expect(titleCaseIfShouting('Nadia Martín')).toBe('Nadia Martín')
  })
})

describe('collapseLetterSpacing', () => {
  it('glues back a heading spread out by CSS letter-spacing', () => {
    expect(collapseLetterSpacing('E X P E R I E N C I A')).toBe('EXPERIENCIA')
    expect(collapseLetterSpacing('R E S U M E N')).toBe('RESUMEN')
  })

  it('leaves ordinary text untouched', () => {
    expect(collapseLetterSpacing('Desarrolladora Senior')).toBe('Desarrolladora Senior')
    expect(collapseLetterSpacing('TypeScript, Python, Go')).toBe('TypeScript, Python, Go')
  })

  it('does not glue short runs that are really separate words', () => {
    expect(collapseLetterSpacing('Go y R')).toBe('Go y R')
  })

  it('makes a tracked-out section header detectable again', () => {
    const spaced = doc([
      { text: 'Ada Lovelace', fontSize: 20, bold: true },
      { text: collapseLetterSpacing('E X P E R I E N C I A'), fontSize: 13, bold: true },
      { text: 'Analista — Babbage 2020 - 2023' },
    ])
    expect(analyze(spaced).sections.map((s) => s.kind)).toEqual(['experience'])
  })
})

describe('joinFragments (spec 037)', () => {
  /** Fragments laid out left to right at 10 pt: [text, gap before it in em]. */
  const line = (...parts: [string, number][]) => {
    let x = 40
    return parts.map(([text, gap]) => {
      x += gap * 10
      const fragment = { x, end: x + text.length * 5, text, fontSize: 10 }
      x = fragment.end
      return fragment
    })
  }

  it('joins pieces of one word that touch', () => {
    expect(joinFragments(line(['Ł', 0], ['ucja', 0.02]))).toBe('Łucja')
    expect(joinFragments(line(['Dvo', 0], ['ř', -0.03], ['ák,', 0.02]))).toBe('Dvořák,')
    expect(joinFragments(line(['lucja', 0], ['.oster@', 0], ['example', 0], ['.com', 0]))).toBe('lucja.oster@example.com')
  })

  it('puts a space where there is a word gap', () => {
    expect(joinFragments(line(['Estudio', 0], ['Nube', 0.17]))).toBe('Estudio Nube')
    expect(joinFragments(line(['Valencia', 0], ['Estudio Nube', 10]))).toBe('Valencia Estudio Nube')
  })

  it('reads the fragments left to right whatever order the PDF draws them in', () => {
    const [first, second] = line(['Ł', 0], ['ucja', 0])
    expect(joinFragments([second!, first!])).toBe('Łucja')
  })
})
