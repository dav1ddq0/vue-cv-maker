// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { withViewTransition } from '@/core/viewTransition'

const css = readFileSync('src/styles/app.css', 'utf8')

afterEach(() => vi.unstubAllGlobals())

describe('withViewTransition (spec 048)', () => {
  it('just runs the update where there are no View Transitions', () => {
    const update = vi.fn()
    withViewTransition(update, {} as Document)
    expect(update).toHaveBeenCalledOnce()
  })

  it('runs the update inside a View Transition when the browser has them', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    const update = vi.fn()
    const start = vi.fn(async (callback: () => Promise<void>) => callback())
    withViewTransition(update, { startViewTransition: start } as unknown as Document)
    expect(start).toHaveBeenCalledOnce()
    expect(update).toHaveBeenCalledOnce()
  })

  it('starts none when the person asks for reduced motion', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    const update = vi.fn()
    const start = vi.fn()
    withViewTransition(update, { startViewTransition: start } as unknown as Document)
    expect(start).not.toHaveBeenCalled()
    expect(update).toHaveBeenCalledOnce()
  })
})

describe('the motion rules (spec 048)', () => {
  it('only animates the View Transition for people who have not asked for reduced motion', () => {
    const block = /@media \(prefers-reduced-motion: no-preference\)\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? ''
    expect(block).toMatch(/::view-transition-group\(\*\)/)
    expect(block).toMatch(/::view-transition-old\(root\)/)
  })

  it('keeps the rule that makes every animation and transition instant on reduced motion', () => {
    expect(css).toMatch(/prefers-reduced-motion: reduce\)\s*\{\s*\*\s*\{[^}]*transition-duration: 0\.01ms !important/)
  })
})
