import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

/** WCAG 1.4.11: the edge that identifies an input needs 3:1 against what is behind it (spec 038). */
const css = readFileSync('src/styles/app.css', 'utf8')
const field = readFileSync('src/components/ui/BaseField.vue', 'utf8')

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
}
const ratio = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi! + 0.05) / (lo! + 0.05)
}
const token = (block: string, name: string) => new RegExp(`--md-${name}:\\s*(#[0-9a-fA-F]{6})`).exec(block)![1]!

const split = css.indexOf('--md-surface-container-lowest: #0c0e12')
const light = css.slice(0, split)
const dark = css.slice(split)

describe('the field ring (spec 038)', () => {
  it('is drawn in the outline colour at rest', () => {
    const rest = /\.box\s*\{[^}]*--indicator:\s*var\(--md-([a-z-]+)\)/.exec(field)
    expect(rest?.[1]).toBe('outline')
  })

  it('reaches 3:1 on the card in light and in dark', () => {
    expect(ratio(token(light, 'outline'), token(light, 'surface-container-lowest'))).toBeGreaterThanOrEqual(3)
    expect(ratio(token(dark, 'outline'), token(dark, 'surface-container'))).toBeGreaterThanOrEqual(3)
  })
})
