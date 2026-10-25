import { describe, expect, it } from 'vitest'
import { PHOTO_ACCEPT, checkPhoto } from '@/core/photo'
import { matchesAccept } from '@/core/fileAccept'

describe('photo rules (spec 020)', () => {
  it('takes JPG, PNG and WebP, not SVG, HEIC or GIF', () => {
    const ok = (name: string, type: string) => matchesAccept({ name, type }, PHOTO_ACCEPT)
    expect(ok('me.jpg', 'image/jpeg')).toBe(true)
    expect(ok('me.png', 'image/png')).toBe(true)
    expect(ok('me.webp', 'image/webp')).toBe(true)
    expect(ok('me.svg', 'image/svg+xml')).toBe(false)
    expect(ok('me.heic', 'image/heic')).toBe(false)
    expect(ok('me.gif', 'image/gif')).toBe(false)
  })

  it('accepts up to 5 MB and reports the size of a larger file', () => {
    expect(checkPhoto({ size: 5 * 1024 * 1024 })).toEqual({ ok: true })
    expect(checkPhoto({ size: 7.3 * 1024 * 1024 })).toEqual({ ok: false, reason: 'tooLarge', sizeMb: '7.3' })
  })
})
