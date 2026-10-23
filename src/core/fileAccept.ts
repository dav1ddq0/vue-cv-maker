/**
 * Whether a file satisfies an `accept` list the way `<input accept>` reads it: `.ext`,
 * an exact MIME type, or a `type/*` wildcard. Needed because dropped files bypass the
 * input's own filtering.
 */
export function matchesAccept(file: Pick<File, 'name' | 'type'>, accept: string): boolean {
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return accept
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
    .some((part) => {
      if (part.startsWith('.')) return name.endsWith(part)
      if (part.endsWith('/*')) return type.startsWith(part.slice(0, -1))
      return type === part
    })
}
