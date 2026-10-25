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

export async function printCv(
  data: CVData,
  templateId: string,
  options: PrintOptions = {},
): Promise<void> {
  const { data: rendered, revoke } = await resolvePhoto(data, 'objectUrl')
  const root = ensurePrintRoot()
  root.innerHTML = ''

  try {
    const html = await renderTemplateHtml(rendered, templateId)

    if (options.paginate) {
      const ok = await paginateInto(root, html, exportCss())
      if (!ok) fillUnpaginated(root, html)
    } else {
      fillUnpaginated(root, html)
    }

    // Pagination is async; the print dialog must not open before it resolves.
    await nextFrame()
    await new Promise<void>((resolve) => {
      const done = () => {
        window.removeEventListener('afterprint', done)
        clearTimeout(timer)
        resolve()
      }
      // Some Safari versions never fire `afterprint`; don't leak the promise.
      const timer = setTimeout(done, 60_000)
      window.addEventListener('afterprint', done)
      window.print()
    })
  } finally {
    root.innerHTML = ''
    releasePagination(root)
    revoke()
  }
}

/** Markup + CSS as handed to paged.js, the HTML export and (Phase 5) WeasyPrint. */
export function exportCss(): string {
  return `${collectDocumentCss()}\n${printCss}`
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
  css: string,
): Promise<boolean> {
  releasePagination(container)
  const before = new Set(document.head.querySelectorAll('style'))
  try {
    const { Previewer } = await import('pagedjs')
    const previewer = new Previewer()
    // The `.cv-page` wrapper is what every print.css rule is scoped to (keep entries whole, section
    // page breaks); without it paged.js laid the CV out ignoring all of them (spec 022).
    const page = `<div class="cv-page cv-page--paged">${html}</div>`
    // An object entry feeds paged.js raw CSS text instead of a URL to fetch.
    await previewer.preview(page, [{ 'cv-export.css': css }], container)
    return container.querySelector('.pagedjs_page') !== null
  } catch (error) {
    // A failed run leaves its half-built pages behind; printed before the fallback they were blank sheets.
    container.innerHTML = ''
    console.warn('[export] paged.js failed; falling back to unpaginated output', error)
    return false
  } finally {
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
