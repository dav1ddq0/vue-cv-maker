# 019 · Desktop redesign, second part

**Status:** implemented ✅

## What it does

Builds what 018 left out of the "CV Maker escritorio" design: template filters, a CEFR level picker for
languages, a "System" theme, a first-run chooser, highlighting the section being edited in the live
preview, and a side-by-side PDF review on wide screens.

## Why

They were designed and deferred in 018 to keep that change reviewable. Each one removes a small
friction: scanning 13 templates without a filter, typing "C1" by hand, a theme that ignores the OS
setting, a first visit that lands on an empty form, not seeing where an edit lands on the page, and a
PDF review that hides the source text behind a toggle.

## Acceptance criteria

- [x] Template gallery: filter chips (All · One column · Two columns · With photo · ATS) built from the templates' own tags; the active template stays selectable.
- [x] Languages: A1–C2 and Native buttons set the level; the free text field stays for anything else ("Bilingual"). "Native" is written in the CV language.
- [x] Theme: Light · Dark · System; System follows `prefers-color-scheme` live. Old preferences keep working.
- [x] First visit (no saved CV): a chooser — blank, from the sample, import — instead of an empty form.
- [x] Desktop preview: the section of the current step (summary, experience, education, skills, languages, custom) is outlined in the page; no outline in the exported HTML or PDF.
- [x] PDF review ≥ 1001px: extracted text in a column beside the review; the toggle stays on narrower screens.
- [x] Tests for each; no horizontal overflow at 1024–1920px; phone and tablet unchanged.

## Out of scope

- Colour thumbnails in My CVs: the template is a global preference, not stored per CV (would need a model change).

## Verification

- 374 unit tests (new: template filters, level picker, theme resolution and the live OS switch, welcome
  view, `data-section` on every section of all 13 templates, PDF review layout, form scroll reset);
  typecheck and build pass.
- Chromium: all nine steps at 1024×768, 1440×900 and 1920×1080 with the sample CV — no horizontal
  overflow, each step opens at the top of the form. The skills outline shows in Meridian's sidebar. The
  System theme follows an emulated OS switch and survives a reload. The welcome view shows on a first
  visit and not once a CV is saved. A PDF made by Chromium imports into the side-by-side review.
- Regression: the 016 phone/tablet sweep gives the same measurements as before.

Found during the sweep and fixed here: moving between steps kept the previous step's scroll position,
which the step rail made frequent. Each step now opens at the top (all widths).

Not covered: real devices, Safari and Firefox, a screen-reader pass. Picking "Blank" on the welcome
view and leaving without typing shows the welcome view again on the next visit (nothing was saved).
