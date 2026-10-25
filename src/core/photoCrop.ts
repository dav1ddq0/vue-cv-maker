/**
 * Geometry of the photo crop (spec 025). Pure, so the edge cases are testable without a canvas.
 *
 * The frame is a square of `frame` units. The image is scaled to cover it at zoom 1 (its short side
 * fills the frame) and `offset` moves the image's centre away from the frame's centre, in frame units.
 */

export interface Size {
  width: number
  height: number
}

export interface Offset {
  x: number
  y: number
}

/** A square in image pixels. */
export interface CropRect {
  x: number
  y: number
  size: number
}

export const ZOOM_MIN = 1
export const ZOOM_MAX = 4
/** Largest stored side; templates show the photo a few centimetres wide (spec 025). */
export const OUTPUT_MAX = 800

/** Scale at which the image's short side fills the frame. */
export function coverScale(image: Size, frame: number): number {
  return frame / Math.min(image.width, image.height)
}

export function clampZoom(zoom: number): number {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom))
}

/** Keeps the image covering the frame: it can move until one of its edges meets the frame's. */
export function clampOffset(image: Size, frame: number, zoom: number, offset: Offset): Offset {
  const scale = coverScale(image, frame) * clampZoom(zoom)
  const maxX = Math.max(0, (image.width * scale - frame) / 2)
  const maxY = Math.max(0, (image.height * scale - frame) / 2)
  const clamp = (value: number, max: number) => Math.min(max, Math.max(-max, value))
  return { x: clamp(offset.x, maxX), y: clamp(offset.y, maxY) }
}

/** The part of the image the frame shows, in image pixels. */
export function cropRect(image: Size, frame: number, zoom: number, offset: Offset): CropRect {
  const scale = coverScale(image, frame) * clampZoom(zoom)
  const { x, y } = clampOffset(image, frame, zoom, offset)
  const size = frame / scale
  // Moving the image right shows more of its left side, so the centre moves the other way.
  const centreX = image.width / 2 - x / scale
  const centreY = image.height / 2 - y / scale
  // Clamped again in image pixels: float rounding must never reach outside the image.
  const inside = (start: number, length: number) => Math.min(length - size, Math.max(0, start))
  return { x: inside(centreX - size / 2, image.width), y: inside(centreY - size / 2, image.height), size }
}

/** Output side in pixels: the crop's own resolution, capped, never upscaled. */
export function outputSize(rect: CropRect): number {
  return Math.max(1, Math.min(OUTPUT_MAX, Math.round(rect.size)))
}

/** Size of the image after `turns` quarter turns. */
export function rotatedSize(image: Size, turns: number): Size {
  return turns % 2 === 0 ? image : { width: image.height, height: image.width }
}
