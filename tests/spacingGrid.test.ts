import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/** The interface, not the CV templates or the print rules, whose spacing sets the paper. */
function interfaceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return interfaceFiles(path)
    return /\.(vue|css)$/.test(name) ? [path] : []
  })
}
const files = [...interfaceFiles('src/components'), 'src/App.vue', 'src/styles/app.css']

describe('the spacing of the interface (spec 045)', () => {
  it('sets padding, margin and gap on the 4 px grid, in px, never in em or rem', () => {
    const loose: string[] = []
    for (const file of files) {
      readFileSync(file, 'utf8').split('\n').forEach((line, index) => {
        const declaration = /^\s*(?:padding|margin|gap|row-gap|column-gap)(?:-[a-z-]+)?\s*:\s*([^;]+);/.exec(line)
        if (!declaration) return
        for (const [, number, unit] of declaration[1]!.matchAll(/(-?\d*\.?\d+)(rem|em|px)\b/g)) {
          const n = Math.abs(Number(number))
          // A hairline (up to 2 px) is not a step of the grid; everything else is a multiple of 4.
          if (unit !== 'px' || (n > 2 && n % 4 !== 0)) loose.push(`${file}:${index + 1} ${line.trim()}`)
        }
      })
    }
    expect(loose).toEqual([])
  })

  it('gives the title of a view one size and weight (spec 045)', () => {
    const css = readFileSync('src/styles/app.css', 'utf8')
    const rule = /\.view-title\s*\{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(rule).toMatch(/font-size:\s*var\(--size-24\)/)
    expect(rule).toMatch(/font-weight:\s*700/)
  })
})
