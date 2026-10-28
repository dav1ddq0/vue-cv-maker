import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/** The `--md-*` colour roles of one theme block of app.css. */
function roles(theme: 'light' | 'dark'): Record<string, string> {
  const css = readFileSync(join(process.cwd(), 'src/styles/app.css'), 'utf8')
  const selector = theme === 'light' ? ':root {' : ":root[data-theme='dark'] {"
  const start = css.indexOf(selector)
  const block = css.slice(start, css.indexOf('\n}', start))
  return Object.fromEntries([...block.matchAll(/--md-([\w-]+):\s*(#[0-9a-f]{6});/g)].map((m) => [m[1]!, m[2]!]))
}

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
}
const contrast = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p)
  return (x! + 0.05) / (y! + 0.05)
}

const SURFACES = ['surface', 'surface-dim', 'surface-bright', 'surface-container-lowest', 'surface-container-low', 'surface-container', 'surface-container-high', 'surface-container-highest']
const ACCENTS = ['primary', 'secondary', 'tertiary', 'error', 'warning', 'success']

describe.each(['light', 'dark'] as const)('M3 colour roles, %s (spec 029)', (theme) => {
  const r = roles(theme)

  it('defines every role the components rely on', () => {
    for (const name of [...SURFACES, 'on-surface', 'on-surface-variant', 'outline', 'outline-variant', 'inverse-surface', 'inverse-on-surface', 'inverse-primary']) expect(r[name], name).toBeDefined()
    for (const a of ACCENTS) for (const name of [a, `on-${a}`, `${a}-container`, `on-${a}-container`]) expect(r[name], name).toBeDefined()
  })

  it('pairs every "on" colour with its container at WCAG AA (4.5:1)', () => {
    for (const a of ACCENTS) {
      expect(contrast(r[a]!, r[`on-${a}`]!), a).toBeGreaterThanOrEqual(4.5)
      expect(contrast(r[`${a}-container`]!, r[`on-${a}-container`]!), `${a}-container`).toBeGreaterThanOrEqual(4.5)
    }
    expect(contrast(r['inverse-surface']!, r['inverse-on-surface']!)).toBeGreaterThanOrEqual(4.5)
  })

  it('keeps text, the accent and outlines legible on every surface', () => {
    for (const s of SURFACES) {
      expect(contrast(r[s]!, r['on-surface']!), `on-surface / ${s}`).toBeGreaterThanOrEqual(4.5)
      expect(contrast(r[s]!, r['on-surface-variant']!), `on-surface-variant / ${s}`).toBeGreaterThanOrEqual(4.5)
      // Primary is also used as text (links, text buttons); outlines bound components (3:1, WCAG 1.4.11).
      expect(contrast(r[s]!, r.primary!), `primary / ${s}`).toBeGreaterThanOrEqual(4.5)
      expect(contrast(r[s]!, r.outline!), `outline / ${s}`).toBeGreaterThanOrEqual(3)
    }
  })
})
