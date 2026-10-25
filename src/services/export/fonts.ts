/**
 * Font embedding for the standalone HTML export (spec 026). The app serves its fonts from its own
 * origin; a file opened from disk cannot reach those URLs, so it carries the faces of the CV's family
 * as `data:` URLs instead, and no other font.
 */
import { blobToDataUrl } from './json'
import { isFontFace } from './render'

/** `"'Source Sans 3', 'Segoe UI', sans-serif"` → `['source sans 3', 'segoe ui', 'sans-serif']`. */
export function familyNames(stack: string): string[] {
  return stack
    .split(',')
    .map((name) => name.trim().replace(/^['"]|['"]$/g, '').toLowerCase())
    .filter(Boolean)
}

/** Fetched once per URL for the life of the page; the same faces serve every later export. */
const cache = new Map<string, Promise<string>>()

function inline(url: string): Promise<string> {
  let pending = cache.get(url)
  if (!pending) {
    pending = fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`Font ${url}: ${response.status}`)
        return response.blob()
      })
      .then(blobToDataUrl)
    pending.catch(() => cache.delete(url))
    cache.set(url, pending)
  }
  return pending
}

/** The woff2 `src` of a face, resolved against the sheet that declared it. */
function woff2Url(rule: CSSFontFaceRule): string | null {
  const match = /url\(["']?([^"')]+\.woff2)["']?\)/.exec(rule.style.getPropertyValue('src'))
  if (!match) return null
  return new URL(match[1]!, rule.parentStyleSheet?.href ?? document.baseURI).href
}

/**
 * `@font-face` rules for every face the document loads for a family in `stack`, with the font file
 * inlined. A face that fails to fetch is left out: the export still works, in the fallback font.
 */
export async function embeddedFontCss(stack: string): Promise<string> {
  const wanted = new Set(familyNames(stack))
  const faces: { rule: CSSFontFaceRule; url: string }[] = []
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRule[]
    try {
      rules = Array.from(sheet.cssRules)
    } catch {
      continue
    }
    for (const rule of rules) {
      if (!isFontFace(rule)) continue
      const family = familyNames(rule.style.getPropertyValue('font-family'))[0]
      const url = family && wanted.has(family) ? woff2Url(rule) : null
      if (url) faces.push({ rule, url })
    }
  }

  const css = await Promise.all(
    faces.map(async ({ rule, url }) => {
      try {
        const data = await inline(url)
        const prop = (name: string) => rule.style.getPropertyValue(name)
        return `@font-face { font-family: ${prop('font-family')}; font-style: ${prop('font-style') || 'normal'}; font-weight: ${prop('font-weight') || '400'}; font-display: swap; src: url(${data}) format('woff2');${prop('unicode-range') ? ` unicode-range: ${prop('unicode-range')};` : ''} }`
      } catch {
        return ''
      }
    }),
  )
  return css.filter(Boolean).join('\n')
}
