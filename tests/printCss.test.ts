import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(join(process.cwd(), 'src/styles/print.css'), 'utf8')

/**
 * paged.js splits selectors on commas before passing them to `querySelectorAll`,
 * so a comma inside `:is()`/`:where()` yields an invalid fragment and aborts
 * pagination for the entire document — silently, as a caught warning.
 * This guards the exact regression that produced an empty paginated preview.
 */
describe('print.css / paged.js compatibility', () => {
  const blocks = css.split('}').filter((block) => /break-(before|after|inside)\s*:/.test(block))

  it('has rules that carry break properties', () => {
    expect(blocks.length).toBeGreaterThan(0)
  })

  it('keeps comma-bearing functional selectors out of every break rule', () => {
    const offenders = blocks
      .map((block) => block.split('{')[0].trim())
      .filter((selector) => /:(is|where|not|has)\([^)]*,/.test(selector))

    expect(offenders).toEqual([])
  })
})

describe('print.css / per-section page breaks (spec 022)', () => {
  it('breaks before sections marked with our own attribute', () => {
    expect(css).toMatch(/\.cv-page \[data-page-break\]\s*\{[^}]*break-before:\s*page/)
  })

  it('never uses data-break-before, which paged.js owns and only honours for its own values', () => {
    expect(css).not.toMatch(/\[data-break-before/)
  })
})

describe('print.css / no blank sheet at the end (spec 036)', () => {
  it('lifts the break paged.js forces after the last page', () => {
    expect(css).toMatch(/\.pagedjs_page:last-of-type\s*\{[^}]*break-after:\s*auto/)
  })
})
