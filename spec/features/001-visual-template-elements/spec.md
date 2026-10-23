# 001 · Visual template elements and two new templates

**Status:** in progress (implemented; photo, multi-page and export still to be checked)

## What it does

Adds three reusable visual elements that templates can opt into, and two new
templates that use them:

1. **Level indicator** — a language's level shown as dots (and, optionally, as
   plain text) instead of only a text label.
2. **Timeline** — Education and Experience entries laid out along a vertical
   line with a marker per entry.
3. **Colour header block** — a full-width header band filled with the accent
   colour, containing name, headline, photo and contact details.

New templates (original designs and names, inspired by common résumé layouts
seen in the market, not copies of any product's templates):

- **`meridian`** — full-height accent-coloured sidebar (photo, contact, languages)
  + main column with a timeline for Education and Experience.
- **`banner`** — rounded accent header block, then two columns (experience and
  education on the left; summary, languages and skills on the right).

## Why

The current six templates differ in geometry but share one visual vocabulary
(plain headings, text-only levels, no timeline, no filled header). Users compare
CV makers by how distinctive and scannable the output looks; these three
elements are the biggest gap, and they are cheap to add because every template
already receives the same `CVData` + `StyleTokens`.

## Acceptance criteria

_Verifiable conditions. Mark `[x]` once met._

### Data model

- [ ] No change to `src/types/cv.ts`, so no migration is needed. The level
      indicator is **derived** from `LanguageEntry.level` (free text) by a pure
      helper; skills keep `items: string[]` and show no indicator in this feature.
- [ ] The helper maps known labels (es/en: native/nativo, advanced/avanzado,
      fluent, intermediate/intermedio, basic/básico, and CEFR A1–C2) to 1–5.
- [ ] An unrecognised level string yields `null`: the template then renders the
      text only, with no indicator. It never throws and never guesses.
- [ ] Recognising the typed level does not depend on the UI language: "Avanzado"
      and "Advanced" both resolve whatever the editor locale is.

### i18n

- [ ] No new dependency: the project's own `useI18n` (`src/i18n`) is used; `vue-i18n`
      is not installed.
- [ ] UI strings (editor labels, hints) go in `es.ts` and `en.ts` through
      `useI18n`; a missing key in `en.ts` is a compile error (`typeof es`).
- [ ] Text printed inside the CV (e.g. the accessible "Level 4 of 5") follows the
      CV content language (`meta.language`), not the UI language. It lives in a
      small es/en table in `templates/shared.ts`, like `MONTHS`, and receives the
      language as a parameter. Templates do not call `useI18n` or any store.
- [ ] Changing the UI language never changes what a CV renders or exports.

### Shared elements

- [ ] The level indicator is a shared component reusable by any template. The
      timeline and the header block are implemented inside each template's own
      markup and CSS, because each template owns its visual language (tech-stack).
      A template stays a pure component of exactly one prop and holds no state
      (existing template contract).
- [ ] Colours come only from `StyleTokens` CSS custom properties; no hardcoded
      colours or fonts in element CSS.
- [ ] The indicator conveys the level to assistive technology (accessible text,
      not colour or dot count alone).

### New templates

- [ ] `meridian` and `banner` each live entirely under `src/templates/<name>/`
      and self-register in `templates/registry.ts`; no changes to consuming code.
- [ ] Each declares `supports`, `defaults`, `tags` and a thumbnail, consistent
      with `TemplateDefinition`.
- [ ] Both render correctly with and without a photo.
- [ ] Both render correctly with empty sections (no empty headings or lines).
- [ ] Both paginate correctly across multiple pages; entries are not split
      mid-entry and the sidebar/header behaves on pages 2+.
- [ ] Both react to accent colour, font family and font/spacing scale changes.
- [ ] PDF/HTML export of both matches the live preview.

### Quality

- [ ] Vitest covers the level helper (known labels, CEFR, unknown, empty,
      case/accents) and the template contract for both new templates.
- [ ] `npm test` and `npm run build` pass.
- [ ] Strings added to both `en` and `es`.

## Out of scope

- Skill levels (would require changing `SkillGroup` in `types/cv.ts` and a
  migration). Deferred to a future feature; see roadmap backlog.
- Pill-style company/institution tags and a repeated contact footer (ideas seen
  in the market; deferred).
- Any change to export, storage or the import pipeline.
- Copying names, copy, imagery or exact layouts of any third-party product.
