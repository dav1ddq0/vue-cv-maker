# 027 · Fixes from the functional review

**Status:** in progress

## What it does

Fixes what the end-to-end functional review of 2026-10-26 found (built site, Chromium, Playwright).

## Acceptance criteria

1. [ ] **A blank CV survives a reload.** "Blank" on the welcome screen stores the empty CV, so a
       reload opens the editor instead of the welcome screen again.
2. [ ] **The phone dock exports on the last step.** On Export the primary dock button is "Export" and
       opens the export sheet, instead of a disabled "Next".
3. [ ] **"Fit" never enlarges the page past 100 %.** The + button can still go to 120 %.
4. [ ] **An untitled custom section is named "Untitled section"** in the section order list (and its
       page-break switch), not "Section title", which is the field's label.
5. [ ] **Screen-reader names:**
       - the header breadcrumb is "Breadcrumb" ("Ruta"), not "Location", which is also a form field;
       - the UI language options read "Español" and "English" (each in its own language, `lang` set),
         not "ES"/"EN" spelled out;
       - every "Remove" button in the editor names what it removes ("Remove Cursos", "Remove Data
         Engineer · Datalab"); the visible text stays "Remove", which the name still contains.

## Out of scope

- A new job starting as "currently here": kept, a design choice (the review only noted it).

## Verification

- Unit tests per item; the review scripts re-run on the built site.
