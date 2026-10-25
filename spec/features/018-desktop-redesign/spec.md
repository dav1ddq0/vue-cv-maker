# 018 · Desktop redesign

**Status:** in progress

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

- [ ] ≥ 1001px: rail with the nine steps and their state (done / missing / optional), progress, an "Add section" shortcut and the storage note; form; preview. Phones and tablets are unchanged.
- [ ] Each step shows "Step n of 9", its title, a one-line intro, and a footer with the named previous / next step.
- [ ] Header (≥ 1001px): brand, "My CVs / <CV name>" breadcrumb, save state in words, undo / redo icon buttons with their shortcut in the tooltip, Import, a preferences popover (UI language, theme, storage note) and a primary Export button.
- [ ] The persistent storage notice is gone from the desktop editor; its text lives in the rail and in preferences. The private-mode warning stays.
- [ ] Export opens a dialog: PDF (recommended) / HTML / JSON, the steps still missing content, and one action button.
- [ ] Experience and education entries are collapsible cards with a one-line summary; a new entry opens expanded.
- [ ] The summary shows its length against the recommended 150–450 characters.
- [ ] The preview toolbar has the template name (goes to the style step) and − / + / Fit zoom buttons instead of the slider.
- [ ] My CVs: a "New CV" tile first in the grid and a search box that filters by name.
- [ ] i18n es/en for every new string; keyboard and screen-reader accessible; no horizontal overflow at 1024, 1280, 1440, 1920px.

## Out of scope (designed, not built now)

- Highlighting the edited section inside the preview (every template would need section markers).
- The first-run chooser, the PDF review redesign, CEFR level picker, "System" theme, template filters,
  colour thumbnails in My CVs (the CV summary stores no template).
