/**
 * Canvas side of the photo crop (spec 025): decoding, rotating, drawing and encoding. The geometry
 * lives in `core/photoCrop.ts`; the dialog's preview and the stored file share `drawCrop`, so what the
 * user frames is exactly what gets saved.
 */
import { outputSize, type CropRect, type Size } from '@/core/photoCrop'

export type CropSource = HTMLCanvasElement | ImageBitmap

export const OUTPUT_TYPE = 'image/jpeg'
const OUTPUT_QUALITY = 0.9

/** Decodes the photo upright: phone pictures carry their orientation in EXIF. */
export function decodePhoto(blob: Blob): Promise<ImageBitmap> {
  return createImageBitmap(blob, { imageOrientation: 'from-image' })
}

export function sizeOf(source: CropSource): Size {
  return { width: source.width, height: source.height }
}

/** The image turned `turns` quarter turns clockwise, as a new source. */
export function rotate(source: CropSource, turns: number): CropSource {
  const quarter = ((turns % 4) + 4) % 4
  if (quarter === 0) return source
  const canvas = document.createElement('canvas')
  const odd = quarter % 2 === 1
  canvas.width = odd ? source.height : source.width
  canvas.height = odd ? source.width : source.height
  const ctx = canvas.getContext('2d')!
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((quarter * Math.PI) / 2)
  ctx.drawImage(source, -source.width / 2, -source.height / 2)
  return canvas
}

/** Paints `rect` of `source` over the whole square canvas, on white (a transparent PNG stays white). */
export function drawCrop(canvas: HTMLCanvasElement, source: CropSource, rect: CropRect): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, rect.x, rect.y, rect.size, rect.size, 0, 0, canvas.width, canvas.height)
}

/** The stored file: the framed square as a JPEG of at most 800 px a side. */
export function encodeCrop(source: CropSource, rect: CropRect): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = outputSize(rect)
  drawCrop(canvas, source, rect)
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('The photo could not be encoded'))),
      OUTPUT_TYPE,
      OUTPUT_QUALITY,
    ),
  )
}
