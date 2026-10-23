# 002 · Design panel: palette, fonts and CV language

**Status:** implemented ✅ (visually checked: palette, language; font select disabled on templates without `customFont`)

## What it does

Three additions to the "Template and style" step, inspired by what the market's
design panels offer:

1. **Colour palette** — five curated swatches shown above the existing free colour
   input (the free input stays, so nothing is taken away).
2. **Font list** — a curated list of fonts with a one-line description each,
   replacing the four-item select.
3. **CV language** — a selector for the language the CV *content* is rendered in
   (`meta.language`), separate from the UI language.

## Why

Colour and font are the two choices people make first. A free colour picker gives
poor results; curated swatches are faster and look better. `meta.language` already
exists in the model and drives dates and section titles, but nothing in the editor
lets the user change it.

## Acceptance criteria

### Palette

- [x] Five swatches: `#ffd86f`, `#7c55e4`, `#f2614c`, `#10cf65`, `#334fdc`.
- [x] Clicking one sets `style.accentColor`; the active one is marked
      (not by colour alone) and exposed with `aria-pressed`.
- [x] The free colour input still works and, when its value is not a swatch, no
      swatch is marked.
- [x] Disabled with the existing reason when the template lacks `accentColor`.

### Fonts

- [x] No new dependency and no network font loading: only font stacks that resolve
      to fonts already on the system, each with a generic fallback.
- [x] Every template's own default font is in the list (so the select never shows
      blank after picking a template).
- [x] Each option has a short description from i18n (es + en).
- [x] Web fonts such as Roboto, Lato or Poppins are NOT included (they would need a
      bundled font package; tracked as out of scope below).

### CV language

- [x] A selector with Spanish and English sets `meta.language`.
- [x] It does not change the UI language, and changing the UI language does not
      change it.
- [x] Dates, section titles and the level label in the preview follow it.
- [x] Undo/redo and autosave treat it like any other change.

### Quality

- [x] No change to `src/types/cv.ts` (so no migration).
- [x] Strings in `es.ts` and `en.ts`; `npm test` and `npm run build` pass.
- [x] Tests for the palette and font-list data and for the language selector.

## Out of scope

- Web fonts (needs a font package or network loading; requires confirmation).
- The 31-country language list: templates only know Spanish and English titles and
  month names. More languages need translated tables, a separate feature.
- Template carousel with rendered thumbnails and preview controls (separate features).
