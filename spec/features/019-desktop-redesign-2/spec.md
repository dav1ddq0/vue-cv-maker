# 019 · Desktop redesign, second part

**Status:** in progress

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

- [ ] Template gallery: filter chips (All · One column · Two columns · With photo · ATS) built from the templates' own tags; the active template stays selectable.
- [ ] Languages: A1–C2 and Native buttons set the level; the free text field stays for anything else ("Bilingual"). "Native" is written in the CV language.
- [ ] Theme: Light · Dark · System; System follows `prefers-color-scheme` live. Old preferences keep working.
- [ ] First visit (no saved CV): a chooser — blank, from the sample, import — instead of an empty form.
- [ ] Desktop preview: the section of the current step (summary, experience, education, skills, languages, custom) is outlined in the page; no outline in the exported HTML or PDF.
- [ ] PDF review ≥ 1001px: extracted text in a column beside the review; the toggle stays on narrower screens.
- [ ] Tests for each; no horizontal overflow at 1024–1920px; phone and tablet unchanged.

## Out of scope

- Colour thumbnails in My CVs: the template is a global preference, not stored per CV (would need a model change).
