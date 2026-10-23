import { describe, expect, it } from 'vitest'
import { applyTemplateDefaults, getTemplate, templates } from '@/templates/registry'
import { createEmptyCV, DEFAULT_STYLE } from '@/core/factory'

describe('per-template style defaults', () => {
  it('gives every template its own accent so the gallery is not one design', () => {
    const accents = templates.map((t) => t.defaults?.accentColor).filter(Boolean)
    expect(accents).toHaveLength(templates.length)
    expect(new Set(accents).size).toBe(templates.length)
  })

  it('adopts the template accent when the user has not chosen one', () => {
    const style = createEmptyCV().style
    const next = applyTemplateDefaults('editorial', style)

    expect(next.accentColor).toBe(getTemplate('editorial').defaults!.accentColor)
  })

  it('never overwrites an accent the user picked', () => {
    const style = { ...createEmptyCV().style, accentColor: '#ff00aa' }

    for (const template of templates) {
      expect(applyTemplateDefaults(template.id, style).accentColor).toBe('#ff00aa')
    }
  })

  it('keeps swapping defaults while the user stays on defaults', () => {
    // Someone browsing templates should see each one's own identity...
    let style = createEmptyCV().style
    style = applyTemplateDefaults('editorial', style)
    style = applyTemplateDefaults('aurora', style)
    expect(style.accentColor).toBe(getTemplate('aurora').defaults!.accentColor)

    // ...until they make a choice, which then sticks.
    style = { ...style, fontFamily: 'Comic Sans MS, cursive' }
    style = applyTemplateDefaults('monograph', style)
    expect(style.fontFamily).toBe('Comic Sans MS, cursive')
  })

  it('leaves the global default recognisable as untouched', () => {
    const style = { ...createEmptyCV().style, accentColor: DEFAULT_STYLE.accentColor }
    expect(applyTemplateDefaults('monograph', style).accentColor).toBe(
      getTemplate('monograph').defaults!.accentColor,
    )
  })

  it('tags every template for the picker', () => {
    for (const template of templates) {
      expect(template.tags.length).toBeGreaterThan(0)
      expect(template.tags.every((tag) => tag.startsWith('tags.'))).toBe(true)
    }
  })
})
