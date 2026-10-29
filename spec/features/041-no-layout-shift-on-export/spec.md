# 041 · The page does not move while a PDF is built

**Status:** implemented ✅

## What it does

Reported from a screen recording of the deployed site: on pressing "Download PDF" the page itself,
not the PDF, seemed to rearrange. Measured with a layout-shift observer and the position of the rail
and the panes, frame by frame, on the deployed site at 1712 × 972 (scale 2, Modern):

- 0.5 s after the click the step rail went from 248 to 220 px, the preview pane from 732 to 614 px and
  the form column widened; about 1.5 s later everything went back. Layout shift 0.088, twice.

**Cause.** `paginateInto` hands paged.js a copy of every stylesheet of the document (the templates'
and, since they cannot be told apart, the interface's). paged.js appends that copy as a `<style>` at
the end of `<head>`, so each rule is there twice and the later one wins the ties. `App.vue` has

    .editor--rail { grid-template-columns: 220px … 0.7fr }
    @media (min-width: 1280px) { .editor--rail { grid-template-columns: 248px … 1fr } }

and the copy of the first came after the second, so on any screen wide enough for the media query the
base rule won for as long as the pages existed: while a PDF was built, while the print dialog was
open, and for as long as the paginated view stayed open. The PDF itself was never affected. It dates
from spec 022, which first fed paged.js the page's CSS.

## The fix

- `exportCss()` returns two sheets, the document's own and the print rules (`ExportCss`), each with a
  marker rule at its head.
- `paginateInto` watches `<head>` while paged.js works and moves the copy of the document's CSS to the
  front of `<head>` the moment it is added (a microtask later, before the browser can lay the page out
  with it in the wrong place). Ahead of the original the copy ties lose to the original, which is the
  order the app had before; the host the PDF is measured in still sees the same rules in the same
  order, and the print rules, still after everything, keep the last word.

## Acceptance criteria

1. [x] Building the direct PDF changes the position of nothing on the page.
2. [x] Opening the paginated view, and keeping it open, changes nothing either.
3. [x] The PDFs are the same as before (`qa:pdf` 111/111).

## Verification

- The same probe against the local build, same size: layout shift 0.0001 (a button's ripple) and 0
  changes of position, instead of 0.088 twice and 4 changes.
- 581 unit tests. New: `tests/pdfPaginateStyles.test.ts` (5 cases: the copy comes first, and already
  while paged.js is working, the print rules stay last, paged.js's own styles keep their place, both
  runs' styles are tagged and released, a run without the marker does not fail). Each rule mutated.
- `qa:e2e` 96/96, with a new block, `layout`: the rail, the form and the preview are sampled on every
  frame during a direct PDF download and with the paginated view open, and must not change (it failed
  with the old code, with the rail at 220 and the preview at 502 px).
- `qa:pdf` 111/111 (its fixture passes the two sheets), `qa:security` 53/53.

## Not changed

- The copy of the interface CSS is still handed to paged.js; telling the templates' rules from the
  interface's would need a split of the stylesheets that the build does not give.
- A graphics glitch of the recording itself (the video also shows corrupted frames after the click) is
  not something the app can influence.
