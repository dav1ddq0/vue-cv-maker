import type { Component } from 'vue'
import type { StyleTokens } from './cv'

export type TemplateCapability =
  | 'photo'
  | 'sidebar'
  | 'accentColor'
  | 'customFont'
  | 'multiPage'
  | 'skillLevels'

export interface TemplateDefinition {
  id: string
  name: string
  /** i18n key; the prose is translated, the `name` stays as stable identity. */
  descriptionKey: string
  /** Inline SVG markup, rendered in the template picker; inherits the accent via `currentColor`. */
  thumbnail: string
  supports: TemplateCapability[]
  /**
   * The template's own visual identity, as *data*.
   *
   * The contract forbids a template from hardcoding colors and fonts in its CSS
   * — it does not forbid it from declaring its preferred ones. These are applied
   * to `StyleTokens` when the user picks the template, and only while they have
   * not chosen their own (see `isUntouched` in the registry). Without this every
   * template renders in the same blue and the same face, and the gallery reads
   * as one design in several geometries.
   */
  defaults?: Pick<StyleTokens, 'accentColor' | 'fontFamily'>
  /**
   * Accent colours the style step offers for this template instead of the shared palette: a template
   * that is built around a family of colours can say so. Every one needs a name in
   * `style.colorNames` (swatches are announced by name) and must read on paper and as ink.
   */
  palette?: readonly string[]
  /** Short i18n keys describing the template at a glance in the picker. */
  tags: string[]
  /** Lazily loaded so unused templates stay out of the initial bundle. */
  component: () => Promise<Component>
}
