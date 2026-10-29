import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/** Every file of the interface (not the CV templates or the print rules, which size the paper). */
function interfaceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return interfaceFiles(path)
    return /\.(vue|css)$/.test(name) ? [path] : []
  })
}
const files = [...interfaceFiles('src/components'), 'src/App.vue', 'src/styles/app.css']

describe('the type scale of the interface (spec 043)', () => {
  it('uses the weights 400, 500, 600 and 700 and no in-between ones of a variable font', () => {
    const odd: string[] = []
    for (const file of files) {
      readFileSync(file, 'utf8').split('\n').forEach((line, index) => {
        const value = /font-weight\s*:\s*([^;]+);/.exec(line)?.[1]?.trim()
        if (value && !/^(?:400|500|600|700|normal|bold|inherit)$/.test(value)) odd.push(`${file}:${index + 1} font-weight: ${value}`)
      })
    }
    expect(odd).toEqual([])
  })

  it('sets every font-size from a size token, or leaves it inherited', () => {
    const allowed = /^(?:var\(--size-\d+\)|var\(--type-[a-z-]+\)|inherit|1em|100%|0|clamp\(var\(--size-\d+\), [0-9.]+vw, var\(--size-\d+\)\))$/
    const loose: string[] = []
    for (const file of files) {
      readFileSync(file, 'utf8').split('\n').forEach((line, index) => {
        const value = /font-size\s*:\s*([^;]+);/.exec(line)?.[1]?.trim()
        if (value && !allowed.test(value)) loose.push(`${file}:${index + 1} font-size: ${value}`)
      })
    }
    expect(loose).toEqual([])
  })

  it('declares the sizes the tokens use, once each, matching the type scale', () => {
    const css = readFileSync('src/styles/app.css', 'utf8')
    const sizes = [...css.matchAll(/--size-(\d+):\s*(\d+)px;/g)].map((m) => [m[1], m[2]])
    expect(sizes.every(([name, value]) => name === value)).toBe(true)
    const typeSizes = new Set([...css.matchAll(/--type-[a-z-]+:\s*\d+\s+(\d+)px/g)].map((m) => m[1]))
    expect(new Set(sizes.map(([name]) => name))).toEqual(typeSizes)
  })

  it('sets the base size of the page from a token, not a loose number', () => {
    const css = readFileSync('src/styles/app.css', 'utf8')
    expect(/body\s*\{[^}]*font-size:\s*var\(--size-14\)/.test(css)).toBe(true)
  })
})

describe('the elevations of the interface (spec 043)', () => {
  it('casts a shadow only from the elevation tokens; rings and indicator lines have no blur', () => {
    const loose: string[] = []
    for (const file of files) {
      readFileSync(file, 'utf8').split('\n').forEach((line, index) => {
        const value = /box-shadow\s*:\s*([^;]+);/.exec(line)?.[1]?.trim()
        if (!value || value === 'none' || /var\(--(?:elevation-[123]|shadow)\)/.test(value)) return
        // Every layer of the value, without its colour: x y blur spread.
        for (const layer of value.replace(/\([^)]*\)/g, '').split(',')) {
          const lengths = layer.replace(/inset/, '').trim().split(/\s+/).filter((part) => /^-?[0-9.]+(?:px|em)?$/.test(part))
          if (parseFloat(lengths[2] ?? '0') !== 0) loose.push(`${file}:${index + 1} box-shadow: ${value}`)
        }
      })
    }
    expect(loose).toEqual([])
  })
})
