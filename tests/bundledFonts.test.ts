import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { FONT_OPTIONS } from '@/core/stylePresets'
import { familyNames } from '@/services/export/fonts'

const css = readFileSync(join(process.cwd(), 'src/styles/fonts.css'), 'utf8')
const imports = [...css.matchAll(/@import '(@fontsource\/[^']+)';/g)].map((m) => m[1]!)

/** The family each Fontsource package registers. */
const FAMILY: Record<string, string> = {
  inter: 'inter',
  'source-sans-3': 'source sans 3',
  'jetbrains-mono': 'jetbrains mono',
  'eb-garamond': 'eb garamond',
  carlito: 'carlito',
  caladea: 'caladea',
}
const shipped = new Set(imports.map((path) => FAMILY[path.split('/')[1]!]).filter(Boolean))

describe('bundled fonts (spec 026)', () => {
  it('imports only Latin subsets, regular to bold plus italic', () => {
    expect(imports.length).toBeGreaterThan(0)
    for (const path of imports) expect(path).toMatch(/\/latin(-ext)?-(400|600|700)(-italic)?\.css$/)
    expect(shipped).toEqual(new Set(Object.values(FAMILY)))
  })

  it('marks an option bundled exactly when its stack names a shipped family', () => {
    for (const option of FONT_OPTIONS) {
      const ships = familyNames(option.value).some((name) => shipped.has(name))
      expect({ id: option.id, bundled: ships }).toEqual({ id: option.id, bundled: option.bundled })
    }
  })

  it('reads family names out of a stack, quotes and case aside', () => {
    expect(familyNames(`'Source Sans 3', "Segoe UI", system-ui, sans-serif`)).toEqual([
      'source sans 3',
      'segoe ui',
      'system-ui',
      'sans-serif',
    ])
  })
})
