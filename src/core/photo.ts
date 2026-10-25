/**
 * What the photo input takes (spec 020): the raster formats every template and browser renders, up to
 * a size that a CV photo never needs to exceed. Pure, so the rules are testable without a DOM.
 */
export const PHOTO_ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp'
export const PHOTO_MAX_MB = 5
const PHOTO_MAX_BYTES = PHOTO_MAX_MB * 1024 * 1024

export type PhotoCheck = { ok: true } | { ok: false; reason: 'tooLarge'; sizeMb: string }

export function checkPhoto(file: Pick<File, 'size'>): PhotoCheck {
  if (file.size <= PHOTO_MAX_BYTES) return { ok: true }
  return { ok: false, reason: 'tooLarge', sizeMb: (file.size / (1024 * 1024)).toFixed(1) }
}
