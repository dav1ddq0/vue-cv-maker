import { describe, expect, it } from 'vitest'
import { slugify } from '@/services/export/download'

describe('slugify (spec 037)', () => {
  it('keeps the base letter of accented names', () => {
    expect(slugify('José Ñúñez-García')).toBe('jose-nunez-garcia')
  })

  it('transliterates Latin letters that have no decomposition', () => {
    expect(slugify('Łucja Øster-Ñúñez')).toBe('lucja-oster-nunez')
    expect(slugify('Jörg Straße')).toBe('jorg-strasse')
    expect(slugify('Æsa Œuvre Đorđe Þór')).toBe('aesa-oeuvre-dorde-thor')
  })

  it('falls back when nothing filesystem-safe is left', () => {
    expect(slugify('Анна')).toBe('cv')
    expect(slugify('  ', 'documento')).toBe('documento')
  })
})
