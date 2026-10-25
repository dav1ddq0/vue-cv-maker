// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'

/** paged.js that builds a page and then fails, the way it did inside a `display: none` root. */
vi.mock('pagedjs', () => ({
  Previewer: class {
    async preview(_html: string, _css: unknown, container: HTMLElement) {
      container.innerHTML = '<div class="pagedjs_pages"><div class="pagedjs_page"></div></div>'
      throw new TypeError("Cannot read properties of null (reading 'getBoundingClientRect')")
    }
  },
}))

const { paginateInto } = await import('@/services/export/pdf')

describe('PDF export pagination (spec 022)', () => {
  it('leaves nothing behind when paged.js fails, so the fallback cannot follow a blank sheet', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const container = document.createElement('div')

    expect(await paginateInto(container, '<p>CV</p>', '')).toBe(false)
    expect(container.innerHTML).toBe('')
  })

  it('keeps the print root rendered on screen; paged.js cannot measure inside display: none', () => {
    const css = readFileSync(join(process.cwd(), 'src/styles/app.css'), 'utf8')
    const rule = /#print-root\s*\{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(rule).not.toMatch(/display:\s*none/)
    expect(rule).toMatch(/visibility:\s*hidden/)
  })
})
