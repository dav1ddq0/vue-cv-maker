import { describe, expect, it } from 'vitest'
import type { ExtractedDocument, ExtractedLine } from '@/services/pdfImport/extract'
import { collapseLetterSpacing, joinFragments } from '@/services/pdfImport/layout'
import { analyze, parseDateRange, titleCaseIfShouting, toPartialIso } from '@/services/pdfImport/heuristics'
import { assembleCV } from '@/services/pdfImport/assemble'

/** Builds an extraction result by hand so the heuristics are testable without a PDF. */
function doc(lines: Array<Partial<ExtractedLine> & { text: string }>): ExtractedDocument {
  const full: ExtractedLine[] = lines.map((line, index) => ({
    page: 1,
    y: 800 - index * 14,
    x: 50,
    end: 50 + line.text.length * 5,
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

describe('tracked-out headings (spec 040)', () => {
  it('reads capitals split into pieces as the section they spell', () => {
    const draft = analyze(
      doc([
        { text: 'Ada Lovelace', fontSize: 20, bold: true },
        { text: 'RE SUMEN', fontSize: 9 },
        { text: 'Analista de sistemas.' },
        { text: 'EXPE RI ENCIA', fontSize: 9 },
        { text: 'Analista — Babbage mar 2020 - 2023' },
        { text: 'FO RM ACIÓN', fontSize: 9 },
        { text: 'Matemáticas — Londres 2010 - 2014' },
        { text: 'C H AR L AS', fontSize: 9 },
        { text: 'Una charla.' },
      ]),
    )
    expect(draft.sections.map((s) => s.kind)).toEqual(['summary', 'experience', 'education'])
    expect(draft.sections[0]!.heading).toBe('RESUMEN')
  })

  it('does not turn ordinary lowercase text into a heading', () => {
    const draft = analyze(doc([{ text: 'Ada Lovelace', fontSize: 20 }, { text: 'Re sumen de cuentas' }, { text: 'texto' }]))
    expect(draft.sections).toEqual([])
  })
})

describe('headings of unknown sections (spec 040)', () => {
  it('splits at a capitals line set apart by a wider gap, so its lines are not read as languages', () => {
    const at = (y: number, text: string, extra: Partial<ExtractedLine> = {}) => ({ text, y, ...extra })
    const draft = analyze(
      doc([
        at(800, 'Ada Lovelace', { fontSize: 20 }),
        at(760, 'IDIOMAS'),
        at(746, 'Inglés (C1)'),
        at(732, 'Francés (B1)'),
        at(700, 'CHARLAS'),
        at(686, 'Una charla sobre máquinas'),
        at(672, 'Otra charla'),
      ]),
    )
    expect(draft.sections.find((s) => s.kind === 'languages')!.lines.map((l) => l.text)).toEqual(['Inglés (C1)', 'Francés (B1)'])
    expect(draft.unclassified.find((b) => b.heading === 'CHARLAS')!.lines).toEqual(['Una charla sobre máquinas', 'Otra charla'])
  })

  it('does not take an acronym inside a list for a heading', () => {
    const at = (y: number, text: string) => ({ text, y })
    const draft = analyze(doc([at(800, 'Ada Lovelace'), at(760, 'COMPETENCIAS'), at(746, 'TypeScript'), at(732, 'SQL'), at(718, 'Go')]))
    expect(draft.sections[0]!.lines.map((l) => l.text)).toEqual(['TypeScript', 'SQL', 'Go'])
  })
})

describe('entries, skills and languages as the templates lay them out (spec 040)', () => {
  const at = (text: string, x: number, y: number, fontSize = 10, extra: Partial<ExtractedLine> = {}) => ({ text, x, y, fontSize, end: x + 200, ...extra })
  const assemble = (lines: Array<Partial<ExtractedLine> & { text: string }>) => assembleCV(analyze(doc(lines)))

  it('reads a title over "Company · dates · Place" as one entry, and sets-in lines as its highlights', () => {
    const cv = assemble([
      at('Ada Lovelace', 40, 800, 22),
      at('EXPERIENCIA', 40, 760, 9),
      at('Analista', 40, 740, 10.2),
      at('Babbage Co · mar 2020 – Actualidad · Londres', 40, 726, 8.6),
      at('Escribió el primer programa.', 40, 708),
      at('Redujo el tiempo de cálculo un 40 %', 52, 690, 10, { end: 330 }),
      at('en la máquina analítica.', 52, 676, 10, { end: 200 }),
      at('Formó a tres personas.', 52, 662, 10, { end: 220 }),
    ])
    expect(cv.experience).toHaveLength(1)
    expect(cv.experience[0]).toMatchObject({ position: 'Analista', company: 'Babbage Co', location: 'Londres', startDate: '2020-03', endDate: null, description: 'Escribió el primer programa.' })
    expect(cv.experience[0]!.highlights).toEqual(['Redujo el tiempo de cálculo un 40 % en la máquina analítica.', 'Formó a tres personas.'])
  })

  it('does not split "Grado en Informática" at the "en" of a degree', () => {
    const cv = assemble([
      at('Ada Lovelace', 40, 800, 22),
      at('FORMACIÓN', 40, 760, 9),
      at('Grado en Matemáticas · Universidad de Londres 2010 - 2014', 40, 740),
    ])
    expect(cv.education[0]).toMatchObject({ degree: 'Grado en Matemáticas', institution: 'Universidad de Londres' })
  })

  it('reads a category line, set a little smaller than its items, as a skill group', () => {
    const cv = assemble([
      at('Ada Lovelace', 40, 800, 22),
      at('COMPETENCIAS', 40, 760, 9),
      at('Lenguajes', 40, 740, 8.8),
      at('TypeScript', 40, 726, 9.2),
      at('Python', 40, 712, 9.2),
      at('Frontend', 40, 698, 8.8),
      at('Vue 3, React', 40, 684, 9.2),
    ])
    expect(cv.skills.map((g) => [g.category, g.items.map((i) => i.name)])).toEqual([
      ['Lenguajes', ['TypeScript', 'Python']],
      ['Frontend', ['Vue 3', 'React']],
    ])
  })

  it('keeps a plain list of skills as one group without a category', () => {
    const cv = assemble([at('Ada Lovelace', 40, 800, 22), at('COMPETENCIAS', 40, 760, 9), at('TypeScript', 40, 740), at('Python', 40, 726)])
    expect(cv.skills.map((g) => [g.category, g.items.map((i) => i.name)])).toEqual([['', ['TypeScript', 'Python']]])
  })

  it('reads languages with their level in the same line, on the next line, or in a whole row', () => {
    const lines = (...texts: string[]) => [at('Ada Lovelace', 40, 800, 22), at('IDIOMAS', 40, 760, 9), ...texts.map((text, i) => at(text, 40, 740 - i * 14))]
    const pairs = (cv: ReturnType<typeof assembleCV>) => cv.languages.map((l) => [l.name, l.level])
    expect(pairs(assemble(lines('Español · Nativo', 'Inglés — C1')))).toEqual([['Español', 'Nativo'], ['Inglés', 'C1']])
    expect(pairs(assemble(lines('Español', 'Nativo', 'Inglés', 'C1')))).toEqual([['Español', 'Nativo'], ['Inglés', 'C1']])
    expect(pairs(assemble(lines('Español (Nativo) · Inglés (C1) · Francés (B1)')))).toEqual([['Español', 'Nativo'], ['Inglés', 'C1'], ['Francés', 'B1']])
  })
})
