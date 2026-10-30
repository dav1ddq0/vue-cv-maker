// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { isFramed, showFramedNotice } from '@/core/frameGuard'

describe('the clickjacking guard (spec 047)', () => {
  it('is not framed when the window is its own top', () => {
    const win = { top: null, self: null } as unknown as Window
    ;(win as { top: unknown }).top = win
    ;(win as { self: unknown }).self = win
    expect(isFramed(win)).toBe(false)
  })

  it('is framed when another window is the top, or when reading it throws', () => {
    expect(isFramed({ top: {}, self: {} } as unknown as Window)).toBe(true)
    const hostile = {}
    Object.defineProperty(hostile, 'top', { get() { throw new DOMException('blocked') } })
    expect(isFramed(hostile as Window)).toBe(true)
  })

  it('replaces the page with one link that opens the app on its own', () => {
    document.body.innerHTML = '<div id="app"><button>Delete</button></div>'
    showFramedNotice(document, 'https://example.test/app/')
    expect(document.querySelector('button')).toBeNull()
    const link = document.querySelector('a')!
    expect(link.target).toBe('_blank')
    expect(link.rel).toContain('noopener')
    expect(link.getAttribute('href')).toBe('https://example.test/app/')
  })
})
