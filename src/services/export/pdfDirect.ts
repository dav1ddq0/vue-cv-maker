/**
 * Direct PDF download (spec 031): the CV paginated exactly as for printing, then redrawn on PDF
 * pages with PDFKit — every word at the position the browser laid it out, in the embedded font.
 * The text stays text (selectable, searchable, readable by ATS) and no print dialog opens.
 *
 * The paginated DOM is the source of truth, not the CV data: one layout engine for the screen, the
 * print and this download, so templates are written once. PDFKit lives only in this module and is
 * loaded on demand.
 */
import type { CVData } from '@/types/cv'
import { familyNames } from './fonts'
import { exportCss, paginateInto, releasePagination } from './pdf'
import { isFontFace, renderTemplateHtml, resolvePhoto } from './render'
import { WOFF } from './pdfFonts'

/** A4 in PDF points. */
const PAGE_PT: [number, number] = [595.28, 841.89]

interface Face {
  family: string
  weight: number
  italic: boolean
  ranges: [number, number][]
  url: string
}

type Rgba = { r: number; g: number; b: number; a: number }

function parseColor(value: string): Rgba | null {
  const srgb = /color\(srgb ([^)]+)\)/.exec(value)
  if (srgb) {
    const [r, g, b, a = 1] = srgb[1]!.replace('/', ' ').split(/\s+/).filter(Boolean).map(Number)
    return { r: r! * 255, g: g! * 255, b: b! * 255, a }
  }
  const rgb = /rgba?\(([^)]+)\)/.exec(value)
  if (!rgb) return null
  const [r, g, b, a = 1] = rgb[1]!.split(/[\s,/]+/).filter(Boolean).map(Number)
  return { r: r!, g: g!, b: b!, a }
}

const visibleColor = (c: Rgba | null): c is Rgba => !!c && c.a > 0.01
const rgbOf = (c: Rgba): [number, number, number] => [c.r, c.g, c.b]

/* ---- fonts ------------------------------------------------------------------------------------ */

function parseRanges(value: string): [number, number][] {
  if (!value) return [[0, 0x10ffff]]
  return value.split(',').map((part) => {
    const [from, to] = part.trim().replace(/^U\+/i, '').split('-')
    return [parseInt(from!, 16), parseInt(to ?? from!, 16)]
  })
}

/** Every bundled face the document declares, with the woff2 file behind it. */
function documentFaces(): Face[] {
  const faces: Face[] = []
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRule[]
    try {
      rules = Array.from(sheet.cssRules)
    } catch {
      continue
    }
    for (const rule of rules) {
      if (!isFontFace(rule)) continue
      const src = /url\(["']?([^"')]+\.woff2)["']?\)/.exec(rule.style.getPropertyValue('src'))
      if (!src) continue
      const weight = rule.style.getPropertyValue('font-weight').trim().split(/\s+/)
      faces.push({
        family: familyNames(rule.style.getPropertyValue('font-family'))[0] ?? '',
        // A variable face ("100 1000") is matched at its lower bound; only the UI font is one.
        weight: Number(weight[0]) || 400,
        italic: /italic|oblique/.test(rule.style.getPropertyValue('font-style')),
        ranges: parseRanges(rule.style.getPropertyValue('unicode-range')),
        url: new URL(src[1]!, rule.parentStyleSheet?.href ?? document.baseURI).href,
      })
    }
  }
  return faces
}

/**
 * The face the browser would use for one character: the first family of the stack that has a face
 * covering it, then the closest style and weight. `null` when only a system font could draw it.
 */
function pickFace(faces: Face[], stack: string[], weight: number, italic: boolean, code: number): Face | null {
  for (const family of stack) {
    const candidates = faces.filter((f) => f.family === family && f.ranges.some(([a, b]) => code >= a && code <= b))
    if (!candidates.length) continue
    return candidates.sort(
      (x, y) => Number(x.italic !== italic) - Number(y.italic !== italic) || Math.abs(x.weight - weight) - Math.abs(y.weight - weight),
    )[0]!
  }
  return null
}

/** A PDF standard font for system-font stacks the page cannot read (Georgia, Arial…). */
function standardFont(stack: string[], weight: number, italic: boolean): string {
  const bold = weight >= 600
  if (stack.includes('monospace')) return `Courier${bold ? '-Bold' : ''}${italic ? (bold ? 'Oblique' : '-Oblique') : ''}`
  if (stack.includes('serif')) return bold ? (italic ? 'Times-BoldItalic' : 'Times-Bold') : italic ? 'Times-Italic' : 'Times-Roman'
  return `Helvetica${bold ? '-Bold' : ''}${italic ? (bold ? 'Oblique' : '-Oblique') : ''}`
}

/** `…/inter-latin-400-normal-C38fXH4l.woff2` (built) or `…/inter-latin-400-normal.woff2` (dev) → its WOFF URL. */
function woffFor(woff2Url: string): string {
  const file = woff2Url.split('/').pop()!.replace(/\.woff2$/, '')
  return WOFF[file] ?? WOFF[file.replace(/-[\w-]{8}$/, '')] ?? woff2Url
}

const fontBytes = new Map<string, Promise<ArrayBuffer>>()
function loadFont(url: string): Promise<ArrayBuffer> {
  let pending = fontBytes.get(url)
  if (!pending) {
    pending = fetch(url).then((r) => {
      if (!r.ok) throw new Error(`Font ${url}: ${r.status}`)
      return r.arrayBuffer()
    })
    pending.catch(() => fontBytes.delete(url))
    fontBytes.set(url, pending)
  }
  return pending
}

/* ---- drawing ---------------------------------------------------------------------------------- */

type Doc = import('pdfkit').default

interface Ctx {
  doc: Doc
  faces: Face[]
  registered: Set<string>
  origin: DOMRect
  k: number
}

const X = (c: Ctx, px: number) => (px - c.origin.left) * c.k
const Y = (c: Ctx, px: number) => (px - c.origin.top) * c.k

function transformText(text: string, transform: string): string {
  if (transform === 'uppercase') return text.toUpperCase()
  if (transform === 'lowercase') return text.toLowerCase()
  if (transform === 'capitalize') return text.replace(/(^|\s)(\S)/g, (_, s, ch: string) => s + ch.toUpperCase())
  return text
}

function drawBox(c: Ctx, el: Element, style: CSSStyleDeclaration) {
  const r = el.getBoundingClientRect()
  if (r.width < 0.5 || r.height < 0.5) return
  const x = X(c, r.left), y = Y(c, r.top), w = r.width * c.k, h = r.height * c.k
  const radius = Math.min(parseFloat(style.borderTopLeftRadius) || 0, r.width / 2, r.height / 2) * c.k
  const bg = parseColor(style.backgroundColor)
  if (visibleColor(bg)) {
    c.doc.save()
    if (radius > 0) c.doc.roundedRect(x, y, w, h, radius)
    else c.doc.rect(x, y, w, h)
    c.doc.fillColor(rgbOf(bg), bg.a).fill()
    c.doc.restore()
  }
  const sides = [
    ['Top', x, y, x + w, y],
    ['Right', x + w, y, x + w, y + h],
    ['Bottom', x, y + h, x + w, y + h],
    ['Left', x, y, x, y + h],
  ] as const
  const widths = sides.map(([s]) => (style.getPropertyValue(`border-${s.toLowerCase()}-style`) === 'none' ? 0 : parseFloat(style.getPropertyValue(`border-${s.toLowerCase()}-width`)) || 0))
  // A uniform border with rounded corners is one stroke; otherwise each side on its own.
  const colors = sides.map(([s]) => parseColor(style.getPropertyValue(`border-${s.toLowerCase()}-color`)))
  if (radius > 0 && widths.every((v) => v > 0 && v === widths[0]) && visibleColor(colors[0]!)) {
    const bw = widths[0]! * c.k
    c.doc.save().lineWidth(bw)
    c.doc.roundedRect(x + bw / 2, y + bw / 2, w - bw, h - bw, Math.max(0, radius - bw / 2))
    c.doc.strokeColor(rgbOf(colors[0]!), colors[0]!.a).stroke()
    c.doc.restore()
    return
  }
  sides.forEach(([, x1, y1, x2, y2], i) => {
    const bw = widths[i]! * c.k
    const color = colors[i]!
    if (bw <= 0 || !visibleColor(color)) return
    // The border sits inside the box: offset the stroke by half its width.
    const inset = bw / 2
    const dx = i === 1 ? -inset : i === 3 ? inset : 0
    const dy = i === 0 ? inset : i === 2 ? -inset : 0
    c.doc.save().lineWidth(bw).moveTo(x1 + dx, y1 + dy).lineTo(x2 + dx, y2 + dy)
    c.doc.strokeColor(rgbOf(color), color.a).stroke().restore()
  })
}

/** Where the baseline of `el`'s text sits under its line box, measured, not guessed from metrics. */
const descentCache = new WeakMap<Element, number>()
function descentOf(el: Element, firstRect: DOMRect): number {
  const cached = descentCache.get(el)
  if (cached !== undefined) return cached
  const probe = document.createElement('span')
  probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline'
  const firstText = Array.from(el.childNodes).find((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim())
  el.insertBefore(probe, firstText ?? el.firstChild)
  const baseline = probe.getBoundingClientRect().bottom
  probe.remove()
  const descent = firstRect.bottom - baseline
  descentCache.set(el, descent)
  return descent
}

async function drawText(c: Ctx, node: Text, style: CSSStyleDeclaration, el: Element) {
  const raw = node.textContent ?? ''
  if (!raw.trim()) return
  const color = parseColor(style.color)
  if (!visibleColor(color)) return
  const stack = familyNames(style.fontFamily)
  const weight = Number(style.fontWeight) || 400
  const italic = style.fontStyle !== 'normal'
  const size = parseFloat(style.fontSize) * c.k
  const spacing = (parseFloat(style.letterSpacing) || 0) * c.k
  const range = document.createRange()
  const words = raw.matchAll(/\S+/g)
  let descent: number | null = null
  for (const match of words) {
    const start = match.index!
    // Segments of one word that share a font file (latin / latin-ext), each placed where it was laid out.
    let segStart = start
    let segFace: Face | null | undefined
    const flush = async (end: number) => {
      if (end <= segStart) return
      range.setStart(node, segStart)
      range.setEnd(node, end)
      const rects = Array.from(range.getClientRects()).filter((r) => r.width > 0)
      if (!rects.length) return
      if (descent === null) descent = descentOf(el, rects[0]!)
      // A word broken across lines (overflow-wrap) yields one rect per line: draw it per character.
      if (rects.length > 1 && end - segStart > 1) {
        for (let i = segStart; i < end; i++) {
          const saved = segStart
          segStart = i
          await drawRun(c, node, i, i + 1, segFace ?? null, stack, weight, italic, size, spacing, color, style.textTransform, descent)
          segStart = saved
        }
        return
      }
      await drawRun(c, node, segStart, end, segFace ?? null, stack, weight, italic, size, spacing, color, style.textTransform, descent)
    }
    for (let i = start; i < start + match[0].length; ) {
      const code = raw.codePointAt(i)!
      const face = pickFace(c.faces, stack, weight, italic, code)
      if (segFace !== undefined && face?.url !== segFace?.url) {
        await flush(i)
        segStart = i
      }
      segFace = face
      i += code > 0xffff ? 2 : 1
    }
    await flush(start + match[0].length)
  }
  range.detach()
}

async function drawRun(
  c: Ctx, node: Text, from: number, to: number, face: Face | null, stack: string[], weight: number, italic: boolean,
  size: number, spacing: number, color: Rgba, transform: string, descent: number,
) {
  const range = document.createRange()
  range.setStart(node, from)
  range.setEnd(node, to)
  const rect = Array.from(range.getClientRects()).find((r) => r.width > 0)
  range.detach()
  if (!rect) return
  let text = transformText((node.textContent ?? '').slice(from, to), transform)
  let fontName: string
  if (face) {
    if (!c.registered.has(face.url)) {
      c.doc.registerFont(face.url, await loadFont(woffFor(face.url)))
      c.registered.add(face.url)
    }
    fontName = face.url
  } else {
    fontName = standardFont(stack, weight, italic)
    // Standard fonts only have WinAnsi glyphs; anything else (emoji, CJK) is left out.
    text = text.replace(/[^\u0000-ÿ€–—‘’“”•…]/g, '')
    if (!text) return
  }
  c.doc.font(fontName).fontSize(size).fillColor(rgbOf(color), color.a)
  // Each run takes exactly the width the browser gave it: glyph advances differ by a hair between
  // engines (kerning, hinting), which otherwise opened uneven gaps between words. Clamped, so a
  // wrong measurement cannot stretch a word visibly.
  const natural = c.doc.widthOfString(text, { characterSpacing: spacing })
  const scaling = natural > 0 ? Math.min(115, Math.max(85, ((rect.width * c.k - spacing) / natural) * 100)) : 100
  c.doc.text(text, X(c, rect.left), Y(c, rect.bottom - descent), {
    lineBreak: false,
    baseline: 'alphabetic',
    characterSpacing: spacing,
    horizontalScaling: scaling,
  })
}

function drawLinks(c: Ctx, page: Element) {
  for (const a of Array.from(page.querySelectorAll<HTMLAnchorElement>('a[href]'))) {
    for (const r of Array.from(a.getClientRects())) {
      if (r.width > 0) c.doc.link(X(c, r.left), Y(c, r.top), r.width * c.k, r.height * c.k, a.href)
    }
  }
}

/* ---- generated content ------------------------------------------------------------------------ */

const NO_PSEUDO = 'cv-pdf-no-pseudo'
const MARKER_ATTR = 'data-pdf-marker'

/** Copies every computed property of `from` onto `el`'s inline style. */
function copyStyle(from: CSSStyleDeclaration, el: HTMLElement) {
  for (let i = 0; i < from.length; i++) {
    const name = from.item(i)
    if (name === 'content') continue
    el.style.setProperty(name, from.getPropertyValue(name))
  }
}

/**
 * `::before` / `::after` and list markers are painted by the browser but are not in the DOM, so
 * neither a Range nor a box query reaches them: separators («·»), bullets and decorative bars went
 * missing. On this private copy of the pages they become real spans with the same computed style,
 * laid out where the browser put them, and are then drawn like any other text or box.
 */
function materializeGenerated(page: Element) {
  const sheet = document.createElement('style')
  sheet.textContent = `.${NO_PSEUDO}::before, .${NO_PSEUDO}::after { content: none !important; } .${NO_PSEUDO}::marker { content: none !important; }`
  page.prepend(sheet)
  const jobs: (() => void)[] = []
  for (const el of Array.from(page.querySelectorAll<HTMLElement>('*'))) {
    if (el === sheet) continue
    for (const which of ['::before', '::after'] as const) {
      const ps = getComputedStyle(el, which)
      const match = /^"((?:[^"\\]|\\.)*)"$/.exec(ps.content)
      if (!match) continue
      const span = document.createElement('span')
      copyStyle(ps, span)
      span.textContent = match[1]!.replace(/\\(.)/g, '$1')
      jobs.push(() => (which === '::before' ? el.prepend(span) : el.append(span)))
      jobs.push(() => el.classList.add(NO_PSEUDO))
    }
    const style = getComputedStyle(el)
    if (style.display === 'list-item' && ['disc', 'circle', 'square'].includes(style.listStyleType) && style.listStylePosition === 'outside') {
      const color = getComputedStyle(el, '::marker').color
      jobs.push(() => el.setAttribute(MARKER_ATTR, `${style.listStyleType}|${color}`))
    }
  }
  // Measure everything first, then change the DOM, so no measurement sees a half-converted page.
  for (const job of jobs) job()
}

/**
 * A list bullet as Chrome paints it: not the "•" glyph but a shape sized from the font's ascent,
 * in whole CSS pixels — d = round(ascent / 3) across, its edge d + 6 px before the text, its
 * centre d − 0.5 px above the baseline. Measured at 10–100 px in Source Sans 3 and Inter, and
 * against the printed PDF; the ascent is read from the item's first line.
 */
function drawMarker(c: Ctx, li: Element) {
  const [type, colour] = li.getAttribute(MARKER_ATTR)!.split('|') as [string, string]
  const color = parseColor(colour)
  const walker = document.createTreeWalker(li, NodeFilter.SHOW_TEXT)
  let text: Text | null = null
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (n.textContent?.trim()) {
      text = n as Text
      break
    }
  }
  if (!text || !visibleColor(color)) return
  const range = document.createRange()
  const first = text.textContent!.search(/\S/)
  range.setStart(text, first)
  range.setEnd(text, first + 1)
  const rect = range.getClientRects()[0]
  range.detach()
  if (!rect) return
  const baseline = rect.bottom - descentOf(text.parentElement!, rect)
  const ascent = baseline - rect.top
  const contentLeft = li.getBoundingClientRect().left + (parseFloat(getComputedStyle(li).paddingLeft) || 0)
  const px = Math.max(1, Math.round(ascent / 3))
  const d = px * c.k
  const cx = X(c, contentLeft - px - 6 - px / 2)
  const cy = Y(c, baseline - (px - 0.5))
  c.doc.save()
  if (type === 'square') c.doc.rect(cx - d / 2, cy - d / 2, d, d).fillColor(rgbOf(color), color.a).fill()
  else if (type === 'circle') c.doc.lineWidth(d / 6).circle(cx, cy, d / 2 - d / 12).strokeColor(rgbOf(color), color.a).stroke()
  else c.doc.circle(cx, cy, d / 2).fillColor(rgbOf(color), color.a).fill()
  c.doc.restore()
}

async function drawPage(c: Ctx, page: Element) {
  const walker = document.createTreeWalker(page, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeType === Node.TEXT_NODE) {
      const el = node.parentElement!
      await drawText(c, node as Text, getComputedStyle(el), el)
      continue
    }
    const el = node as Element
    const style = getComputedStyle(el)
    if (style.display === 'none' || style.opacity === '0') continue
    drawBox(c, el, style)
    if (el.hasAttribute(MARKER_ATTR)) drawMarker(c, el)
  }
  drawLinks(c, page)
}

/* ---- entry ------------------------------------------------------------------------------------ */

/** Builds the CV as a PDF file, laid out exactly as the print would be. */
export async function buildDirectPdf(data: CVData, templateId: string, title: string): Promise<Blob> {
  const [{ default: PDFDocument, registerStdFonts }, ...std] = await Promise.all([
    import('pdfkit'),
    import('pdfkit/standard-fonts/Helvetica'),
    import('pdfkit/standard-fonts/HelveticaBold'),
    import('pdfkit/standard-fonts/HelveticaOblique'),
    import('pdfkit/standard-fonts/HelveticaBoldOblique'),
    import('pdfkit/standard-fonts/TimesRoman'),
    import('pdfkit/standard-fonts/TimesBold'),
    import('pdfkit/standard-fonts/TimesItalic'),
    import('pdfkit/standard-fonts/TimesBoldItalic'),
    import('pdfkit/standard-fonts/Courier'),
    import('pdfkit/standard-fonts/CourierBold'),
    import('pdfkit/standard-fonts/CourierOblique'),
    import('pdfkit/standard-fonts/CourierBoldOblique'),
  ])
  registerStdFonts(...std.map((m) => m.default))

  const { data: rendered } = await resolvePhoto(data, 'dataUrl')
  const host = document.createElement('div')
  // Laid out (paged.js measures it) but never seen; opacity rather than visibility, which every
  // descendant would inherit and read as "hidden".
  host.style.cssText = 'position:fixed;left:-10000px;top:0;opacity:0;pointer-events:none'
  document.body.appendChild(host)
  const copyHost = host.cloneNode(false) as HTMLElement
  document.body.appendChild(copyHost)
  try {
    const html = await renderTemplateHtml(rendered, templateId)
    if (!(await paginateInto(host, html, exportCss()))) throw new Error('Pagination failed')
    await document.fonts?.ready
    // paged.js keeps resize observers on its pages and re-runs layout when one changes size, which
    // the span conversion below does. A copy keeps paged.js's styles but none of its observers.
    const pagesCopy = host.cloneNode(true) as HTMLElement
    pagesCopy.removeAttribute('id')
    copyHost.appendChild(pagesCopy)

    const doc = new PDFDocument({ size: PAGE_PT, margin: 0, autoFirstPage: false, info: { Title: title, Creator: 'CV Maker' }, lang: data.meta.language })
    const chunks: Uint8Array[] = []
    doc.on('data', (chunk) => chunks.push(chunk))
    const done = new Promise<void>((resolve) => doc.on('end', resolve))
    const faces = documentFaces()
    const registered = new Set<string>()
    for (const page of Array.from(pagesCopy.querySelectorAll('.pagedjs_page'))) {
      doc.addPage({ size: PAGE_PT, margin: 0 })
      materializeGenerated(page)
      const origin = page.getBoundingClientRect()
      await drawPage({ doc, faces, registered, origin, k: PAGE_PT[0] / origin.width }, page)
    }
    doc.end()
    await done
    return new Blob(chunks as BlobPart[], { type: 'application/pdf' })
  } finally {
    releasePagination(host)
    host.remove()
    copyHost.remove()
  }
}
