import { describe, expect, it } from 'vitest'
import { shortcutFor } from '@/core/shortcuts'
import { dashPattern } from '@/services/export/pdfDirect'

const key = (k: string, mods: Partial<{ ctrlKey: boolean; metaKey: boolean; shiftKey: boolean }> = {}) => ({ key: k, ctrlKey: false, metaKey: false, shiftKey: false, ...mods })
const idle = { previewExpanded: false, dialogOpen: false, inTextField: false }

describe('shortcutFor (spec 035)', () => {
  it('collapses the expanded preview on Esc, but leaves Esc to an open dialog', () => {
    expect(shortcutFor(key('Escape'), { ...idle, previewExpanded: true })).toBe('collapsePreview')
    expect(shortcutFor(key('Escape'), { ...idle, previewExpanded: true, dialogOpen: true })).toBeNull()
    expect(shortcutFor(key('Escape'), idle)).toBeNull()
  })

  it('undoes and redoes with Ctrl/Cmd+Z and Shift, except inside a text field', () => {
    expect(shortcutFor(key('z', { ctrlKey: true }), idle)).toBe('undo')
    expect(shortcutFor(key('Z', { metaKey: true, shiftKey: true }), idle)).toBe('redo')
    expect(shortcutFor(key('z', { ctrlKey: true }), { ...idle, inTextField: true })).toBeNull()
    expect(shortcutFor(key('z'), idle)).toBeNull()
  })
})

describe('dashPattern (spec 035)', () => {
  it("follows Chrome's dashes and dots, stretched to start and end with a mark", () => {
    expect(dashPattern('dashed', 1, 337)).toEqual({ mark: 3, gap: (337 - 68 * 3) / 67 })
    expect(dashPattern('dashed', 3, 600)).toEqual({ mark: 6, gap: (600 - 67 * 6) / 66 })
    expect(dashPattern('dotted', 2, 100)).toEqual({ mark: 2, gap: (100 - 26 * 2) / 25 })
    expect(dashPattern('solid', 1, 100)).toBeNull()
  })
})
