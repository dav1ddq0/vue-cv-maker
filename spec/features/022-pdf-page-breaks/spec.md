# 022 · PDF page breaks: blank-page fix and per-section breaks

**Status:** implemented ✅

## What it does

1. Fixes the PDF export, which added a blank first page and ignored every page-break rule.
2. Lets the user start a chosen section on a new page of the PDF (P2 in the 011 gap analysis).

## Why

- Reported by the user: "a veces añade páginas en blanco". Reproduced with Playwright with the sample
  CV on the 7 templates measured (Aurora to Facet): the PDF had 2 pages, the first one blank.
- Cause: `#print-root` is `display: none` on screen. paged.js measures the content it paginates;
  inside an unrendered element it throws (`Cannot read properties of null (reading
  'getBoundingClientRect')`), `printCv` falls back to unpaginated output, and the half-built paged.js
  page is left in front of it. So the PDF got an empty sheet, then the CV with only the browser's own
  breaks (no "keep entry together" rules, no repeated margins). The paginated preview in the Export
  step uses a visible host, so it looked right and hid the problem.
- "Sometimes": very short CVs could get through paged.js even unmeasured.
- A long CV often has a section (education, a project list) that reads better starting on a fresh
  page instead of being split under the previous one.

## Acceptance criteria

### Blank pages
- [x] The print root is laid out (off-screen, invisible) instead of `display: none`; paged.js
      paginates it without errors.
- [x] A failed pagination clears its partial output before the fallback, so a failure can never
      print a blank sheet.
- [x] For every template, the sample CV and a long CV (4× the experience) produce a PDF with as many
      pages as paged.js laid out and no page without text.

### Found while checking
- [x] paged.js receives the CV inside `.cv-page` (with a modifier that drops the sheet height), so the
      `print.css` rules scoped to it apply when paginating: entries kept whole, headings kept with
      their content. Before, the wrapper was only added in the unpaginated fallback.
- [x] paged.js styles do not pile up. It appends 3 `<style>` elements to `<head>` per run and never
      removes them; the next export copied them into its CSS, which doubled every run (72 KB → 166 →
      354 → 728 KB) until a PDF took minutes or hung. Each container now keeps only its latest run's
      styles (released when printing ends or the preview unmounts) and `collectDocumentCss` skips them.
- [x] Two-column templates place their columns explicitly (`grid-column`). On a continuation page
      with only one column's fragment, auto-placement put Aurora's main column into the 33 % sidebar
      track (Meridian and Modern share the layout; the main-first templates had the mirror case).

### Per-section page break
- [x] `CVData.pageBreaks: string[]` holds the ids of sections that start on a new page; schema v5
      with a v4 → v5 step; `normalize` keeps only ids of existing sections.
- [x] The section order list (Custom sections step) has a "Start on a new page" switch per section,
      except the first one; it is undoable and autosaved like any edit.
- [x] Templates mark the main-column section with `data-page-break`; `print.css` breaks before it.
      The PDF, the paginated preview and printing the exported HTML all honour it.
- [x] Sections a two-column template puts in its sidebar are not broken (a break there would push
      the whole main column to the next page); the list says the switch only affects the main column.

## Out of scope

- Break markers in the live (unpaginated) preview.
- Manual breaks inside a section.

## Verification

- 413 unit tests (new: v4 → v5 migration and filtering, `resolveSections` flag, the switch in the order
  list, every template marking a flagged main section and never a sidebar one, `print.css` using its
  own attribute, paged.js getting the `.cv-page` wrapper, a failed run leaving nothing behind, styles
  kept per container and released).
- Playwright, real `printCv` + Chromium PDF, all 13 templates × {sample, long (4× experience), long
  with a break before Formación}: no blank page in any of the 39 PDFs, PDF page count equal to the
  paginated count, Formación alone on a fresh page in every break case. Before the fix, the 7
  templates measured (Aurora to Facet) each gave 2 pages with a blank first one.
- CSS handed to paged.js across 4 runs: 72 KB each time (before: 72 → 166 → 354 → 728 KB).
- Through the UI (sample CV, switch on Formación, Exportar → PDF twice): 2 pages, none blank, no
  paged.js styles left after printing, no console errors. Switch screenshots at 1440×900 and 390×844,
  no horizontal overflow.
- Ledger and Monograph put the sample's last section on page 2 with or without these changes (checked
  both ways); Harbor, Banner, Facet and Chevron still print their sidebar after the main column on long
  CVs, as before.
- Not checked: Safari and Firefox print engines (paged.js output only verified in Chromium).
