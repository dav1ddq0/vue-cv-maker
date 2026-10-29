# 035 · Review fixes: dashed borders, untested branches, `qa/` checks

**Status:** implemented ✅

## What it does

A five-axis review of 028–034 found one visible defect and four branches no test would catch. Both
were approved by the user on 2026-10-29 (R1, R2), with `qa:*` scripts allowed in `package.json`.

1. **(R1) Dashed and dotted borders came out solid in the direct PDF** (Banner, Chevron, Ledger).
   They are now drawn with Chromium's own pattern, measured on screen and in print: dashed is a
   3w mark and 2w gap (2w and w from 3 px), dotted a w mark and w gap, and the gap stretches so
   each side starts and ends with a mark. Rounded corners are kept for solid borders only.
2. **(R2) Four mutations survived the suite**: opacity inherited from an ancestor (M4), the list
   bullet's gap (M8), the side-column check inverted (M9), Esc collapsing the preview under an open
   dialog (M5). M5 is now a pure decision in `src/core/shortcuts.ts`, unit-tested. M4, M8 and M9
   only show in a real browser, so the browser checks used during 031–034 move into the repository
   as `qa/`, and the direct PDF's drawing half is exported as `pdfFromPagination` so they can feed
   it small fixtures.

## `qa/` (needs Playwright Chromium and poppler: `pdftoppm`, `pdftotext`, `pdfinfo`)

| Script | Server | What it checks |
|---|---|---|
| `npm run qa:pdf` | dev | 13 templates × sample / photo / long / page break, print vs direct: same pages, no text missing, ≤ 4 % pixels differing. A fixture page (half-opaque box, list bullet, dashed and dotted borders) compared shape by shape. Side-column warning off for the sample, on for 80 links. |
| `npm run qa:e2e` | preview (built) | The 81 end-to-end checks with timing budgets: first load, editing, steps, templates, exports, import, documents, phone, widths. |
| `npm run qa:security` | preview (built) | Hostile JSON (×2) and PDF from `qa/fixtures/security`, imported through the UI and exported every way: nothing runs, nothing leaves the origin, outputs checked for what they contain. |
| `npm run qa` | — | Build, then all three. |

Servers start on a free port and stop at the end; outputs go to `.qa/` (ignored).

## Acceptance criteria

1. [x] Dashed and dotted borders in the direct PDF have the marks of the print (fixture: 46/46
       dashes, 77/77 dots; Banner, Chevron and Ledger within threshold).
2. [x] M4, M5, M8, M9 and two mutations of R1 are killed: M5 and the dash rule by unit tests, the
       rest by `qa:pdf`.
3. [x] `qa:pdf`, `qa:e2e` and `qa:security` exit non-zero on any failed check.
4. [x] No behaviour change outside the direct PDF's borders.

## Verification

- 494 unit tests (new: `shortcutFor`, `dashPattern`), typecheck, build.
- Mutations: M4 (opacity ancestors), M8 (bullet gap), M9 (side column inverted), R1 (no dash) killed
  by `qa:pdf`; M5 (Esc under a dialog) and R1b (dotted drawn as dashed) by unit tests.
- `qa:pdf`: 59/59; at most 2.5 % of pixels differing.
- `qa:e2e`: 81/81. `qa:security`: 53/53.

## Found, not fixed (reported to the user)

- **The print sometimes ends in a blank page.** Chromium adds one when the paginated pages fill the
  sheets to the last fraction of a pixel (e.g. Harbor long CV: 2 × 1122.516 px against 2 × 297 mm).
  The DOM is identical in the good and the bad runs. It is intermittent, more frequent after a
  direct PDF has been built in the same tab, and already happened before 033. The direct PDF is not
  affected. `qa:pdf` reports it as a warning and compares the pages before it.
