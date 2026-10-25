import { describe, expect, it } from 'vitest'
import { clampOffset, clampZoom, coverScale, cropRect, outputSize, rotatedSize } from '@/core/photoCrop'

const portrait = { width: 3000, height: 4000 }
const FRAME = 280

describe('photo crop geometry (spec 025)', () => {
  it('covers the frame with the short side at zoom 1', () => {
    expect(coverScale(portrait, FRAME)).toBeCloseTo(280 / 3000)
    expect(cropRect(portrait, FRAME, 1, { x: 0, y: 0 })).toEqual({ x: 0, y: 500, size: 3000 })
  })

  it('keeps the zoom between 1× and 4×', () => {
    expect(clampZoom(0.2)).toBe(1)
    expect(clampZoom(9)).toBe(4)
    expect(cropRect(portrait, FRAME, 9, { x: 0, y: 0 }).size).toBe(750)
  })

  it('stops moving where an image edge meets the frame', () => {
    // At zoom 1 the short side already fills the frame: no horizontal room, 46.67 units vertically.
    const clamped = clampOffset(portrait, FRAME, 1, { x: 50, y: 500 })
    expect(clamped.x).toBe(0)
    expect(clamped.y).toBeCloseTo((4000 * (280 / 3000) - 280) / 2)
    expect(cropRect(portrait, FRAME, 1, { x: 0, y: 500 })).toEqual({ x: 0, y: 0, size: 3000 })
    expect(cropRect(portrait, FRAME, 1, { x: 0, y: -500 }).y).toBeCloseTo(1000)
  })

  it('moving the image right shows more of its left side', () => {
    // Zoom 2: the image is 560 units wide, so it can move 140 each way; centred, x is 750.
    const rect = cropRect(portrait, FRAME, 2, { x: 70, y: 0 })
    expect(rect.size).toBe(1500)
    expect(rect.x).toBeCloseTo(375)
    expect(cropRect(portrait, FRAME, 2, { x: 140, y: 0 }).x).toBeCloseTo(0)
  })

  it('stores at most 800 px and never upscales', () => {
    expect(outputSize({ x: 0, y: 0, size: 3000 })).toBe(800)
    expect(outputSize({ x: 0, y: 0, size: 412.4 })).toBe(412)
  })

  it('swaps width and height on an odd number of quarter turns', () => {
    expect(rotatedSize(portrait, 1)).toEqual({ width: 4000, height: 3000 })
    expect(rotatedSize(portrait, 2)).toEqual(portrait)
  })
})
