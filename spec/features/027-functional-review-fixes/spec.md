# 027 · Fixes from the functional review

**Status:** implemented ✅

## What it does

Fixes what the end-to-end functional review of 2026-10-26 found (built site, Chromium, Playwright).

## Acceptance criteria

1. [x] **A blank CV survives a reload.** "Blank" on the welcome screen stores the empty CV, so a
       reload opens the editor instead of the welcome screen again.
2. [x] **The phone dock exports on the last step.** On Export the primary dock button is "Export" and
       opens the export sheet, instead of a disabled "Next".
3. [x] **"Fit" never enlarges the page past 100 %.** The + button can still go to 120 %.
4. [x] **An untitled custom section is named "Untitled section"** in the section order list (and its
       page-break switch), not "Section title", which is the field's label.
5. [x] **Screen-reader names:**
       - the header breadcrumb is "Breadcrumb" ("Ruta"), not "Location", which is also a form field;
       - the UI language options read "Español" and "English" (each in its own language, `lang` set),
         not "ES"/"EN" spelled out;
       - every "Remove" button in the editor names what it removes ("Remove Cursos", "Remove Data
         Engineer · Datalab"); the visible text stays "Remove", which the name still contains.

## Out of scope

- A new job starting as "currently here": kept, a design choice (the review only noted it).

## Verification

- 448 unit tests (new or updated: the welcome screen stores the blank CV; the dock's last-step action;
  the untitled section's name and the named Remove buttons; the language options' names and `lang`).
- The functional review re-run on the built site (Chromium): the main flow (19 checks), custom
  sections, style, export and import, My CVs, preferences, phone (10 checks) and the overflow sweep
  at 320/768/1024 px all pass, with no console errors. Specifically: a blank CV reloads into the
  editor; on the phone the last step's main action is "Exportar" and opens the export sheet; at
  2560 px the page fits at 100 %, + reaches 120 % and Fit returns to 100 %.
- Three checks of the first run were false positives of the script (text-transform in Monograph, a
  locator matching another "+", the remove button's name) and were rewritten to check the real thing.
