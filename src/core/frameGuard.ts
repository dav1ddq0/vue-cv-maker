/**
 * Clickjacking guard (spec 047). `frame-ancestors` cannot be set from the CSP meta tag, and GitHub
 * Pages sends no headers, so the page refuses to start when another page has framed it.
 */
export function isFramed(win: Window = window): boolean {
  try {
    return win.top !== win.self
  } catch {
    // A cross-origin parent can make reading `top` throw: that is a frame too.
    return true
  }
}

/** Replaces the page with a link that opens the app on its own, so nothing can be clicked through a frame. */
export function showFramedNotice(doc: Document = document, url: string = location.href): void {
  const link = doc.createElement('a')
  link.href = url
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  link.textContent = 'Keireki Craft'
  link.style.cssText = 'display:block;padding:24px;font:16px system-ui,sans-serif'
  doc.body.replaceChildren(link)
}
