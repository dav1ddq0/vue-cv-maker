# 018 · Desktop redesign

**Status:** implemented ✅

## What it does

Rebuilds the editor for screens wider than 1000px after the design canvas "CV Maker escritorio"
(artifact, 15 screens): a three-column layout (step rail · form · live preview), a header with the
document name, save state in words and Export as the main action, an export dialog, collapsible entry
cards, a summary length meter, a preview toolbar with template shortcut and zoom buttons, and a
documents page with a "new CV" tile and search.

## Why

Measured on the live site at 1440×900: the nine steps sat in a horizontal strip that scrolled and cut
labels ("rmación"); every experience entry was fully expanded, so two entries filled the screen; Export
was only reachable as step 9; the save state was a lone "✓"; a yellow storage notice took a full row;
the preview had a bare zoom slider and no way to reach the template from it.

## Acceptance criteria

- [x] ≥ 1001px: rail with the nine steps and their state (done / missing / optional), progress, an "Add section" shortcut and the storage note; form; preview. Phones and tablets are unchanged.
- [x] Each step shows "Step n of 9", its title, a one-line intro, and a footer with the named previous / next step.
- [x] Header (≥ 1001px): brand, "My CVs / <CV name>" breadcrumb, save state in words, undo / redo icon buttons with their shortcut in the tooltip, Import, a preferences popover (UI language, theme, storage note) and a primary Export button.
- [x] The persistent storage notice is gone from the desktop editor; its text lives in the rail and in preferences. The private-mode warning stays.
- [x] Export opens a dialog: PDF (recommended) / HTML / JSON, the steps still missing content, and one action button.
- [x] Experience and education entries are collapsible cards with a one-line summary; a new entry opens expanded.
- [x] The summary shows its length against the recommended 150–450 characters.
- [x] The preview toolbar has the template name (goes to the style step) and − / + / Fit zoom buttons instead of the slider.
- [x] My CVs: a "New CV" tile first in the grid and a search box that filters by name.
- [x] i18n es/en for every new string; keyboard and screen-reader accessible; no horizontal overflow at 1024, 1280, 1440, 1920px.

## Out of scope (designed, not built now)

- Highlighting the edited section inside the preview (every template would need section markers).
- The first-run chooser, the PDF review redesign, CEFR level picker, "System" theme, template filters,
  colour thumbnails in My CVs (the CV summary stores no template).

## Verification

- 350 unit tests (new: step rail, desktop header, export dialog, collapsible entries and summary meter,
  preview toolbar, My CVs search); typecheck and build pass.
- Chromium, sample CV: no horizontal overflow at 1024×768, 1100×800, 1280×800, 1440×900 and 1920×1080.
  At 1024px the first pass squeezed the form (stacked footer, one-column template grid) and the preview
  toolbar overflowed by 10px; fixed with a narrower rail and a 1 : 0.7 form/preview split below 1280px.
- Walked by hand: preferences popover (opens, switches to dark, closes with Esc), export dialog (lists the
  empty core steps, links to them), collapsible entries, zoom buttons and Fit, My CVs grid.
- Regression: the 016 phone/tablet sweep (320–430, 768, 844×390) gives the same measurements as before.

Collapsible entries and the summary meter apply at every width, phones included: they are not
desktop-specific and the phone form gains the most from shorter entries.

Not covered: real devices, Safari and Firefox (the preferences popover has a fallback for engines without
the `popover` attribute, untested), screen-reader pass.
