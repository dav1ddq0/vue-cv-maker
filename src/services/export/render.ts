import { createApp, h } from 'vue'
import type { CVData } from '@/types/cv'
import { getTemplate } from '@/templates/registry'
import { loadPhoto } from '@/services/storage'
import { blobToDataUrl } from './json'

/**
 * Renders a template component to an HTML string, off-screen.
 *
 * This is what keeps "one source of truth per template" (spec §3) true across
 * all three outputs: the live preview, the printable HTML and the PDF all come
 * from the same `.vue` component. Nothing here knows a template's markup.
 */
export async function renderTemplateHtml(data: CVData, templateId: string): Promise<string> {
  const component = await getTemplate(templateId).component()
  const host = document.createElement('div')
  // Off-screen rather than `display: none`: hidden subtrees skip layout, and
  // paged.js needs real box metrics to decide where pages break.
  host.style.cssText = 'position:absolute;left:-99999px;top:0;width:210mm;'
  document.body.appendChild(host)

  const app = createApp({ render: () => h(component, { data }) })
  app.mount(host)
  await nextFrame()
  const html = host.innerHTML
  app.unmount()
  host.remove()
  return html
}

/**
 * Collects every same-origin stylesheet rule currently applied to the app.
 *
 * Scoped-style CSS is emitted by Vite as `<style>` tags in dev and as a linked
 * sheet in a build, so reading the live CSSOM is the only way to get a
 * template's styles without duplicating them. Cross-origin sheets throw on
 * `cssRules` access and are skipped.
 */
export function collectDocumentCss(): string {
  const chunks: string[] = []
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) chunks.push(rule.cssText)
    } catch {
      // Cross-origin sheet (e.g. a font CDN) — the @import in the export head covers it.
    }
  }
  return chunks.join('\n')
}

/**
 * Swaps the `photo:{id}` storage reference for something renderable.
 * `object` URLs are cheap and right for on-screen preview; exports need a
 * `data:` URL so the file still shows the photo once it leaves this browser.
 */
export async function resolvePhoto(
  data: CVData,
  as: 'objectUrl' | 'dataUrl',
): Promise<{ data: CVData; revoke: () => void }> {
  const reference = data.personal.photo
  if (!reference?.startsWith('photo:')) return { data, revoke: () => {} }

  const blob = await loadPhoto(reference)
  if (!blob) {
    const stripped = { ...data, personal: { ...data.personal, photo: undefined } }
    return { data: stripped, revoke: () => {} }
  }

  const url = as === 'objectUrl' ? URL.createObjectURL(blob) : await blobToDataUrl(blob)
  const resolved = { ...data, personal: { ...data.personal, photo: url } }
  return {
    data: resolved,
    revoke: () => {
      if (as === 'objectUrl') URL.revokeObjectURL(url)
    },
  }
}

/** Two frames: one for Vue to patch the DOM, one for the browser to lay it out. */
function nextFrame(): Promise<void> {
  return new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  )
}
