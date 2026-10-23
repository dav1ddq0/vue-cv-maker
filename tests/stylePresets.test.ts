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
