# 032 · The side column stays on page one

**Status:** implemented ✅

## What it does

In Banner, Harbor, Facet and Chevron, a CV longer than one page printed (and downloaded) its whole
side column after the main one: Banner's summary, skills and languages landed on page 3; Harbor's
page 1 had no e-mail or phone at all. Found by the generated-CV tests of 2026-10-28.

Cause: paged.js splits content in DOM order, and these templates put the side column after the main
one in the markup (grid-column only moved it on screen). When the main column overflowed page 1,
everything after the break — the whole side column — went to the next page.

## Acceptance criteria

1. [x] In the four templates the side column comes before the main one in the DOM, so it is laid
       out on page 1 and the main column breaks onto the next pages. On screen nothing moves.
2. [x] Reading order stays sensible for text extraction (ATS): the name comes first; in Harbor the
       header leaves the main column so it still precedes the contact details.
3. [x] Page 1 of a long CV holds the side column's content (contact, skills, languages, summary
       where the template puts it there), in print and in the direct download.
4. [x] A one-page CV looks the same as before (no visual change).

## How

- Banner, Facet, Chevron: `<aside>` moved before the main column; the grid packs `row dense`, so the
  main column returns to the free track beside it.
- Harbor: the name header leaves the main column and comes first, then the sidebar (spanning both
  rows, so the dark band still starts at the top), then the main column; explicit rows.

## Verification

- One-page CVs (sample, with photo) in the four templates: 0.00 % of pixels differ from the print
  before the change.
- Long CVs (sample × 4 jobs, page break, and the generated Banner 3-page and Harbor 2-page CVs):
  page 1 holds the side column's content — contact, e-mail, phone, skills, languages, Banner's
  summary — in the print and in the direct download (checked with `pdftotext`, ignoring the spaces
  letter-spaced titles extract with).
- Print vs direct download for the four templates × sample, photo, long, page break: same pages,
  full text, at most 2 % of pixels differing.
- 482 unit tests; the E2E suite 81/81.

## Out of scope

- The side column's background band on continuation pages (it ends with page 1), and on page 1 of a
  long Harbor CV, where it stops a little short of the paper's foot (same family as "the band does
  not reach the foot" from the generated-CV tests).
- A side column longer than a whole page (then the main column starts on page 2).
