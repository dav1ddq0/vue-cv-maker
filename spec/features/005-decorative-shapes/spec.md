# 005 · Readable ink on accent backgrounds and two geometric templates

**Status:** proposed

## What it does

1. **Readable ink**: templates that fill an area with the accent colour print their text
   in whichever of white or near-black has the better contrast with that accent.
   Exposed to templates as the CSS variable `--cv-on-accent`.
2. Two templates built on geometric shapes (inline SVG, accent coloured), with original
   names and designs:
   - **`chevron`** — a full-width chevron-shaped header band with the photo set into
     its notch, centred name, two columns below.
   - **`facet`** — corner shapes (quarter circle and triangle) framing the first page,
     round photo beside the name, two columns with a ruled divider.

## Why

The palette offers yellow and green, on which white text is unreadable. This affects any
template with an accent-filled area (`meridian`, `banner`, and the new ones). Geometric
shapes are the last visual family seen across the reference designs not covered yet.

## Acceptance criteria

- [ ] `onAccent(hex)` returns `#ffffff` or `#1a1a1a`, whichever has the higher WCAG contrast
      with the accent; invalid input falls back to `#ffffff`. Pure function with tests.
- [ ] `styleVars` exposes `--cv-on-accent`.
- [ ] `meridian` and `banner` use it for text and level marks on accent areas; every
      palette colour gives at least 4.5:1 for normal text on those areas (test).
- [ ] `chevron` and `facet` live under `src/templates/<name>/`, self-register, pass the
      template contract tests, have unique default accents and a font from `FONT_OPTIONS`.
- [ ] Shapes are `aria-hidden`, print with `print-color-adjust: exact`, and follow the
      accent; text on them uses `--cv-on-accent`.
- [ ] Both render with and without a photo and with an empty CV (no stray headings).
- [ ] Checked in the browser; es/en descriptions; `npm test`, typecheck and build pass.

## Out of scope

- Repeating shapes on every printed page (needs paged.js margin boxes; shapes sit on the
  first page / end of content).
- Changing the existing `modern` template (it has the same contrast issue; reported, not
  changed, because it was not part of this work).
