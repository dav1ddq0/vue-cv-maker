// Page images for visual comparison, with no image library: `pdftoppm -gray` writes binary PGM,
// which is a short header and one byte per pixel.
const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

/** Renders every page of `pdf` at `dpi` in grey; returns [{ width, height, pixels }]. */
function renderPages(pdf, dpi) {
  const prefix = pdf.replace(/\.pdf$/, '')
  execFileSync('pdftoppm', ['-r', String(dpi), '-gray', pdf, prefix])
  const dir = path.dirname(prefix)
  const base = path.basename(prefix)
  return fs
    .readdirSync(dir)
    .filter((f) => f.startsWith(base + '-') && f.endsWith('.pgm'))
    .sort()
    .map((f) => readPgm(path.join(dir, f)))
}

function readPgm(file) {
  const buf = fs.readFileSync(file)
  // Header: "P5", width, height, maxval, separated by whitespace (comments start with #).
  const fields = []
  let i = 0
  while (fields.length < 4) {
    while (/\s/.test(String.fromCharCode(buf[i]))) i++
    if (buf[i] === 0x23) {
      while (buf[i] !== 0x0a) i++
      continue
    }
    let field = ''
    while (!/\s/.test(String.fromCharCode(buf[i]))) field += String.fromCharCode(buf[i++])
    fields.push(field)
  }
  const width = Number(fields[1])
  const height = Number(fields[2])
  return { width, height, pixels: buf.subarray(i + 1, i + 1 + width * height) }
}

/** Percentage of pixels whose grey differs by more than `threshold` (missing page: 100). */
function diffPercent(a, b, threshold = 48) {
  if (!a || !b) return 100
  const w = Math.min(a.width, b.width)
  const h = Math.min(a.height, b.height)
  let differing = 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (Math.abs(a.pixels[y * a.width + x] - b.pixels[y * b.width + x]) > threshold) differing++
    }
  }
  return (100 * differing) / (w * h)
}

module.exports = { renderPages, diffPercent }
