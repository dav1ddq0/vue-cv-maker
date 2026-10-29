import type { CVData } from '@/types/cv'
import printCss from '@/styles/print.css?raw'
import { collectDocumentCss, renderTemplateHtml, resolvePhoto } from './render'

/**
 * Every interaction with paged.js is confined to this module (spec §6 and the
 * risk register): the library is lightly maintained and rewrites the DOM it
 * touches. Templates never import it, and if it has to go, only this file
 * changes — plain `window.print()` remains a complete fallback.
 */

const PRINT_ROOT_ID = 'print-root'

/** Marks the `<style>` elements a paged.js run added to `<head>`; `collectDocumentCss` skips them. */
export const PAGED_STYLE_ATTR = 'data-cv-paged'

/**
 * paged.js appends its styles to `<head>` on every run and never removes them. Left there, the next
 * export copied them into its own CSS, which then doubled on every run (72 KB, 166 KB, 354 KB…) until
 * pagination crawled (spec 022). Each container keeps only the styles of its latest run.
 */
const pagedStyles = new WeakMap<HTMLElement, HTMLStyleElement[]>()

/** Drops the styles of `container`'s last pagination; call once its pages are gone. */
export function releasePagination(container: HTMLElement): void {
  for (const style of pagedStyles.get(container) ?? []) style.remove()
  pagedStyles.delete(container)
}

export interface PrintOptions {
  /** Run paged.js first. Falls back to plain print if pagination fails. */
  paginate?: boolean
}

/**
 * What the browser proposes as the PDF's file name: it uses `document.title` (spec 024).
 * "Nadia Martín Reyes – CV"; the document title when there is no name; "CV" when there is neither.
 */
export function printTitle(data: CVData): string {
  // Path characters, control characters and bidi overrides (U+202E could make "…exe.pdf" read as
  // something else) never reach the file name or the PDF's title (spec 034).
  const clean = (value: string) =>
    value
      .replace(/[/\\:*?"<>|\u0000-\u001f\u007f\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  const name = clean(data.personal.fullName)
  if (name) return `${name} – CV`
  return clean(data.meta.title) || 'CV'
}

export async function printCv(
  data: CVData,
  templateId: string,
  options: PrintOptions = {},
): Promise<void> {
  const { data: rendered, revoke } = await resolvePhoto(data, 'objectUrl')
  const root = ensurePrintRoot()
  root.innerHTML = ''
  const appTitle = document.title

  try {
    const html = await renderTemplateHtml(rendered, templateId)

    if (options.paginate) {
      const ok = await paginateInto(root, html, exportCss())
      if (!ok) fillUnpaginated(root, html)
    } else {
      fillUnpaginated(root, html)
    }

    // Pagination is async; the print dialog must not open before it resolves, nor before the fonts
    // the pages ask for have loaded (spec 026).
    await nextFrame()
    await document.fonts?.ready
    await new Promise<void>((resolve) => {
      const done = () => {
        window.removeEventListener('afterprint', done)
        clearTimeout(timer)
        resolve()
      }
      // Some Safari versions never fire `afterprint`; don't leak the promise.
      const timer = setTimeout(done, 60_000)
      window.addEventListener('afterprint', done)
      document.title = printTitle(data)
      window.print()
    })
  } finally {
    document.title = appTitle
    root.innerHTML = ''
    releasePagination(root)
    revoke()
  }
}

/**
 * The CSS paged.js is given, in two sheets so that they can be told apart in `<head>` afterwards:
 * the document's own (the templates' and, since they cannot be told from them, the interface's) and
 * the print rules, which must stay the last word.
 */
export interface ExportCss {
  app: string
  print: string
}

/** A rule at the head of each sheet, to find the `<style>` paged.js makes of it (spec 041). */
const APP_SHEET = 'cv-export-app-sheet'
const PRINT_SHEET = 'cv-export-print-sheet'

/** Markup + CSS as handed to paged.js, the HTML export and (Phase 5) WeasyPrint. */
export function exportCss(): ExportCss {
  // No @font-face: the fonts are already registered in this document, and paged.js re-declares every
  // rule it gets in a sheet of its own, where the copied font URLs no longer resolve. Being later,
  // those broken faces won, and the PDF came out in the system font (spec 026).
  return {
    app: `.${APP_SHEET}{--cv-export-sheet:app}\n${collectDocumentCss({ fontFaces: false })}`,
    print: `.${PRINT_SHEET}{--cv-export-sheet:print}\n${printCss}`,
  }
}

/**
 * Paginates `html` into `container` using paged.js.
 *
 * `container` MUST live outside the Vue-managed tree: paged.js chunks and
 * rewrites the nodes it is given, and Vue patching the same nodes afterwards
 * produces corrupted output. Callers pass an imperative-only element.
 *
 * Returns `false` when pagination failed, so callers can fall back.
 */
export async function paginateInto(
  container: HTMLElement,
  html: string,
  css: ExportCss,
): Promise<boolean> {
  releasePagination(container)
  const before = new Set(document.head.querySelectorAll('style'))
  // paged.js appends a copy of the document's CSS, interface included, after the original. Equal
  // rules then come twice and the later copy wins their ties, so a base rule beat the media query
  // that overrides it and the app re-laid itself out for as long as the pages existed: the rail
  // and the panes moved while a PDF was built or the paginated view was open (spec 041). Ahead of
  // the original the copy changes nothing there, and the host still sees the same rules in the
  // same order, the print rules last. It is moved as soon as it is added, a microtask before the
  // browser can lay the page out with it in the wrong place, not when paged.js is done.
  const place = (records: MutationRecord[]) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node instanceof HTMLStyleElement && node.textContent?.includes(APP_SHEET) && document.head.firstChild !== node) document.head.prepend(node)
      }
    }
  }
  const mover = new MutationObserver(place)
  mover.observe(document.head, { childList: true })
  try {
    const { Previewer } = await import('pagedjs')
    const previewer = new Previewer()
    // The `.cv-page` wrapper is what every print.css rule is scoped to (keep entries whole, section
    // page breaks); without it paged.js laid the CV out ignoring all of them (spec 022).
    const page = `<div class="cv-page cv-page--paged">${html}</div>`
    // An object entry feeds paged.js raw CSS text instead of a URL to fetch.
    await previewer.preview(page, [{ 'cv-export-app.css': css.app }, { 'cv-export-print.css': css.print }], container)
    return container.querySelector('.pagedjs_page') !== null
  } catch (error) {
    // A failed run leaves its half-built pages behind; printed before the fallback they were blank sheets.
    container.innerHTML = ''
    console.warn('[export] paged.js failed; falling back to unpaginated output', error)
    return false
  } finally {
    mover.disconnect()
    const added = [...document.head.querySelectorAll('style')].filter((style) => !before.has(style))
    for (const style of added) style.setAttribute(PAGED_STYLE_ATTR, '')
    pagedStyles.set(container, added)
  }
}

/** Phase 1 path: a single flowing page, the browser decides the breaks. */
function fillUnpaginated(root: HTMLElement, html: string): void {
  const page = document.createElement('div')
  page.className = 'cv-page'
  page.innerHTML = html
  root.appendChild(page)
}

function ensurePrintRoot(): HTMLElement {
  let root = document.getElementById(PRINT_ROOT_ID)
  if (!root) {
    root = document.createElement('div')
    root.id = PRINT_ROOT_ID
    document.body.appendChild(root)
  }
  return root
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  )
}
