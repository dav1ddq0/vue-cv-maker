# 004 · Three new template families

**Status:** implemented ✅ (photo checked by test only)

## What it does

Adds three templates, each a different structure from what exists, with original
names and designs inspired by common résumé layouts (not copies of any product):

- **`ledger`** — one column; each section is a row with its title as a label column
  on the left and its content on the right. Dashed rules and `dashes` level marks.
  No photo. Aimed at readability and ATS.
- **`harbor`** — dark neutral sidebar on the **right** (photo, contact, skills,
  languages with `stars` levels) and a main column with accent headings.
- **`frame`** — a boxed header (accent border, photo, name, contact) over a single
  column; skills and languages as a two-column block with `bars` levels. Serif default.

## Why

After 001–003 the gallery has 8 templates but no label-column layout, no right-hand
dark sidebar and no boxed header, and the `stars` and `dashes` level indicators are
unused. These three cover those gaps with the fewest moving parts.

## Acceptance criteria

- [x] Each template lives entirely under `src/templates/<name>/` (`index.ts`,
      `Template.vue`, `thumbnail.ts`) and self-registers; no change to consuming code.
- [x] Each passes the template contract tests (one `data` prop, no stores, tokens
      for colour and font, entries protected from page breaks).
- [x] Each has a unique default accent, a default font that exists in `FONT_OPTIONS`,
      and truthful `supports` (`ledger` has no photo).
- [x] Each renders the sample CV and an empty CV without stray headings, and reacts to
      accent, font and scale changes.
- [x] Languages and rated skills show level marks with the accessible label in the CV
      language; unrated or unrecognised levels show text only.
- [x] `harbor` and `frame` render correctly with and without a photo.
- [x] Descriptions in `es.ts` and `en.ts`; existing tags reused.
- [x] Checked in the browser (preview) for each template.
- [x] `npm test`, `npm run typecheck`, `npm run build` pass.

## Out of scope

- Decorative geometric shapes (feature 005).
- Multi-page and PDF export verification beyond what the existing paginated preview shows
  (tracked in 001 task 8).
