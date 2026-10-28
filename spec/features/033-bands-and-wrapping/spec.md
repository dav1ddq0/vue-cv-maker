# 033 · Full-height bands, side-column check, address wrapping

**Status:** implemented ✅

## What it does

The three loose ends of the generated-CV tests (2026-10-28) and of 032:

1. **Side bands reach the foot of every page** (Aurora, Modern, Meridian, Harbor). The band was the
   sidebar's own background, so it ended with the sidebar's content (half a page on a short CV) and
   was missing on every continuation page.
2. **A side column taller than page 1 is reported.** A two-column layout cannot split it sensibly:
   the main column would only start on page 2. The export step and the export dialog now say so and
   suggest shortening skills or languages, or a one-column template.
3. **E-mails and URLs wrap at sensible points**: after "@", before a dot or slash — not
   "carmen.ortega@example.co / m" (Modern's sidebar).

## Acceptance criteria

1. [x] In print and in the direct download, the band of the four templates covers the full sheet
       height on every page; page counts unchanged.
2. [x] A side column taller than what page 1 leaves it shows a warning in the export step and the
       export dialog; an ordinary CV shows none.
3. [x] Contact items and visible URLs in all 13 templates carry break opportunities (`<wbr>`) after
       "@" and before ".", "/", "?", "#", "&", "="; the text itself is unchanged (copy, ATS).

## How

- Bands: an `::before` on the template's article, 297 mm tall, behind the content (`z-index: -1`,
  `isolation: isolate`). Paginated, each page starts the article's fragment at the top of the
  sheet. paged.js unsets `::before` on continuation fragments (`[data-split-from]`, not important),
  so the templates restore it with `content: '' !important` for theirs. On screen the band sits
  under the sidebar's own background. The direct PDF draws it like any generated box.
- Check: `sideColumnOverflows` mounts the template off-screen and compares the side column's
  content (`[data-side]`), from where it starts, with an A4 sheet; `useSideColumnFit` re-measures
  500 ms after edits and drops stale answers. The stored photo is measured as a transparent pixel
  (templates size it by CSS).
- Wrapping: `breakParts` (shared.ts) and `Breakable.vue` render the parts with `<wbr>`.

## Verification

- 487 unit tests. New: `breakParts` (e-mail, URL keeping "://", text without break points); the
  side-column measure keeps only the latest answer; the export dialog shows the warning.
- 13 templates × sample, photo, long CV, page break: same page counts as before, print and direct
  download agree (0 characters missing, ≤ 2.1 % of pixels differ). The banded templates show the
  band to the foot of every page in both outputs.
- Built site, Chromium: a Harbor CV with 72 skills and 8 languages is warned in the export step and
  the dialog; the sample CV is not. Modern with Inter: "carmen.ortega@example | .com" and
  "carmen.ortega.sanz@ | hospitalmiguelservet.es" in print and in the direct download.
- E2E suite 81/81. The 031 "no print dialog" check now has a control (it hooked `window.print` with
  an init script added after load, which never applied; fixed in the QA scripts).

## Out of scope

- Splitting a too-long side column across pages beside the main one (not possible with this layout
  engine); the user is told instead.
