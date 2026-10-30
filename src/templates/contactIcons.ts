/** The e-mail, phone, location and link glyphs of the templates that draw their contact lines with icons. */
export type ContactKind = 'mail' | 'phone' | 'pin' | 'info'

export type LinkKind = 'linkedin' | 'github' | 'link'

/** Stroke paths of 24-unit icons. */
export const CONTACT_ICONS: Record<ContactKind | LinkKind, string> = {
  phone: 'M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  pin: 'M12 21s-6-5.6-6-10.5a6 6 0 0 1 12 0C18 15.4 12 21 12 21zM12 8.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
  info: 'M12 11v6M12 7.5v.5M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z',
  // The "in" of a professional network: a dot, a stem and an arch.
  linkedin: 'M7 10v7M7 6.6v.4M11 17v-7M11 13a3 3 0 0 1 6 0v4',
  // A code host: the branch glyph, which is not any company's logo.
  github: 'M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9a9 9 0 0 1-9 9',
  link: 'M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
}

/** Which icon a contact line gets: the line is the e-mail, the phone or the location, or something else. */
export function contactKind(text: string, personal: { email: string; phone: string; location: string }): ContactKind {
  return text === personal.email ? 'mail' : text === personal.phone ? 'phone' : text === personal.location ? 'pin' : 'info'
}

/** Which icon a link gets: a known network by its host, otherwise the globe. */
export function linkKind(url: string): LinkKind {
  try {
    const host = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname.toLowerCase()
    const is = (domain: string) => host === domain || host.endsWith(`.${domain}`)
    return is('linkedin.com') ? 'linkedin' : is('github.com') ? 'github' : 'link'
  } catch {
    return 'link'
  }
}
