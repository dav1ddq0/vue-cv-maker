# 022 · PDF page breaks: blank-page fix and per-section breaks

**Status:** in progress

## What it does

1. Fixes the PDF export, which added a blank first page and ignored every page-break rule.
2. Lets the user start a chosen section on a new page of the PDF (P2 in the 011 gap analysis).

## Why

- Reported by the user: "a veces añade páginas en blanco". Reproduced with Playwright on all 13
  templates and the sample CV: the PDF had 2 pages, the first one blank.
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
- [ ] The print root is laid out (off-screen, invisible) instead of `display: none`; paged.js
      paginates it without errors.
- [ ] A failed pagination clears its partial output before the fallback, so a failure can never
      print a blank sheet.
- [ ] For every template, the sample CV and a long CV (4× the experience) produce a PDF with as many
      pages as paged.js laid out and no page without text.

### Per-section page break
- [ ] `CVData.pageBreaks: string[]` holds the ids of sections that start on a new page; schema v5
      with a v4 → v5 step; `normalize` keeps only ids of existing sections.
- [ ] The section order list (Custom sections step) has a "Start on a new page" switch per section,
      except the first one; it is undoable and autosaved like any edit.
- [ ] Templates mark the main-column section with `data-page-break`; `print.css` breaks before it.
      The PDF, the paginated preview and printing the exported HTML all honour it.
- [ ] Sections a two-column template puts in its sidebar are not broken (a break there would push
      the whole main column to the next page); the list says the switch only affects the main column.

## Out of scope

- Break markers in the live (unpaginated) preview.
- Manual breaks inside a section.

## Verification

- Unit tests: migration v4 → v5, `normalize` filtering, `resolveSections` carrying the flag, the
  switch in the order list, every template rendering `data-page-break` for a flagged main section.
- Playwright: PDF of every template, sample and long CV, blank-page count; a long CV with a break
  before Education starts that section at the top of a page.
