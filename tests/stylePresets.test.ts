import { describe, expect, it } from 'vitest'
import { PALETTE, isSameColor } from '@/core/stylePresets'

describe('palette', () => {
  it('offers five distinct, valid hex colours', () => {
    expect(PALETTE).toHaveLength(5)
    expect(new Set(PALETTE).size).toBe(5)
    for (const color of PALETTE) expect(color).toMatch(/^#[0-9a-f]{6}$/)
  })

  it('compares colours ignoring case and spaces', () => {
    expect(isSameColor('#FFD86F', '#ffd86f')).toBe(true)
    expect(isSameColor(' #ffd86f ', '#ffd86f')).toBe(true)
    expect(isSameColor('#ffd86e', '#ffd86f')).toBe(false)
  })
})

describe('font options', () => {
  it('has unique ids and values, each ending in a generic family', async () => {
    const { FONT_OPTIONS } = await import('@/core/stylePresets')
    expect(new Set(FONT_OPTIONS.map((f) => f.id)).size).toBe(FONT_OPTIONS.length)
    expect(new Set(FONT_OPTIONS.map((f) => f.value)).size).toBe(FONT_OPTIONS.length)
    for (const font of FONT_OPTIONS) expect(font.value).toMatch(/(sans-serif|serif|monospace)$/)
  })

  it('lists every template default and the global default, so the select is never blank', async () => {
    const { FONT_OPTIONS } = await import('@/core/stylePresets')
    const { templates } = await import('@/templates/registry')
    const { DEFAULT_STYLE } = await import('@/core/factory')
    const values = FONT_OPTIONS.map((f) => f.value)
    expect(values).toContain(DEFAULT_STYLE.fontFamily)
    for (const template of templates) {
      if (template.defaults) expect(values).toContain(template.defaults.fontFamily)
    }
  })
})

describe('CV languages', () => {
  it('only offers languages every template table covers', async () => {
    const { CV_LANGUAGES } = await import('@/core/stylePresets')
    const { formatPartialDate, levelAccessibleLabel, resolveSections } = await import('@/templates/shared')
    const { createSampleCV } = await import('@/core/sample')

    for (const { code } of CV_LANGUAGES) {
      // A language missing from a table silently falls back to Spanish, so compare
      // against the Spanish output: a covered language must produce its own text.
      if (code !== 'es') {
        expect(formatPartialDate('2023-04', code)).not.toBe(formatPartialDate('2023-04', 'es'))
        expect(levelAccessibleLabel(3, code)).not.toBe(levelAccessibleLabel(3, 'es'))
        const cv = createSampleCV()
        cv.meta.language = code
        const titles = resolveSections(cv).map((s) => s.title)
        const spanish = resolveSections({ ...cv, meta: { ...cv.meta, language: 'es' } }).map((s) => s.title)
        expect(titles).not.toEqual(spanish)
      }
    }
  })
})
