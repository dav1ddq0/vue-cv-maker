/** Triggers a browser download for an in-memory blob, revoking the URL afterwards. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  // Revoking synchronously cancels the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Latin letters that do not decompose into a base letter and a mark, so NFD alone would drop them. */
const LETTERS: Record<string, string> = { ł: 'l', ø: 'o', ß: 'ss', æ: 'ae', œ: 'oe', đ: 'd', ð: 'd', þ: 'th', ħ: 'h', ı: 'i' }

/** Filesystem-safe filename stem derived from the CV's name or title. */
export function slugify(value: string, fallback = 'cv'): string {
  const slug = value
    .toLowerCase()
    .replace(/[łøßæœđðþħı]/g, (letter) => LETTERS[letter]!)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || fallback
}
