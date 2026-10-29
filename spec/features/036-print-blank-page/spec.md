# 036 · No blank sheet at the end of the print

**Status:** implemented ✅

## What it does

Found by `qa:pdf` in 035: the printed PDF sometimes ended in an empty page. paged.js forces a break
after every page, the last one included (`.pagedjs_page { break-after: page }` in its print styles),
and the pages fill their sheets to the last fraction of a pixel (Harbor, long CV: 2 × 1122.516 px
against 2 × 297 mm), so Chromium sometimes honoured that last break with a blank sheet. It was
intermittent, more frequent after a direct PDF had been built in the same tab, and older than 033.
The direct PDF was never affected.

`print.css` lifts the break after the last page (`.pagedjs_page:last-of-type`, print only).

## Acceptance criteria

1. [x] The print never ends in a blank page: `qa:pdf` now fails on one instead of warning.
2. [x] Page counts and page breaks are unchanged (same counts as the direct PDF, 52 cases).

## Verification

- Before: 4 of 24 prints with a blank last page (Harbor, Compact, Monograph; direct PDF built
  between prints). After: 0 of 24 in the same run, and 0 of 117 across 13 templates × sample / long /
  page break × 3.
- 495 unit tests (new: the print.css rule), typecheck.
- `qa:pdf` 111/111 twice (52 new blank-page checks), `qa:e2e` 81/81, `qa:security` 53/53.
