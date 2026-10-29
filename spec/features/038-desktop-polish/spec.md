# 038 · Desktop polish: dates, lighter fields, export contrast

**Status:** implemented ✅

## What it does

Reported from a screenshot of the Experience step on desktop: the native month input looks out of
place, the grey fields are heavy, and highlights are boxes inside a box. The export dialog's
"Before you export" block also blends into the dialog in dark.

1. **A · Month and year.** `MonthField` replaces `<input type="month">` in `DateRangeFields`. It is
   a native `<select>` for the month and a numeric year input, inside the usual field container.
   - Month names come from the UI language (`Intl`), not the browser's, so an English browser on a
     Spanish UI no longer shows "March 2022".
   - The month is optional: a year alone is stored as `YYYY`, as PDF import already produces. The
     native input showed those dates empty.
   - The stored value stays `''`, `YYYY` or `YYYY-MM`. A month without a year stores nothing.
   - The native controls bring keyboard and screen-reader support without a custom popup.
   - "I work here now" disables both controls and empties them.
2. **B · Lighter fields.**
   - The container fill goes from `surface-container-highest` to `surface-container-high`, hover and
     disabled included. One step lower, `surface-container`, would vanish in dark, where the card is
     that colour.
   - Rounded corners all round (`--shape-md`, asked for by the user) with a ring in place of the
     bottom line: outline-variant at rest, outline on hover, primary and 2 px in focus, error for a
     warning.
   - Highlights (`TagInput`) become rows with a divider, like the skills in `SkillItemsEditor`,
     instead of outlined chips.
3. **Rounder chrome.** The smaller radii of the app chrome go from 8 px (`--shape-sm`) to 12 px
   (`--shape-md`): the header select and document title, the preferences action, the entry card
   header, the PDF review select, the export side warning, the crop dialog's secondary button, the
   template thumbnails and the preview toolbar chip. The logo mark, the `kbd` hint, the crop frame
   and the page highlight keep theirs.
4. **D · Export contrast.** The "Before you export" block gets a container (`surface-container-lowest`)
   that reads against the dialog (`surface-container-high`) in both themes.

## Acceptance criteria

1. [x] The experience and education dates have no native month input; a year alone is accepted.
2. [x] The month names follow the UI language.
3. [x] Fields and highlights are lighter in light and dark, with 0 contrast issues in the audit.
4. [x] The "Before you export" block is distinguishable from the dialog in dark.

## Verification

- 512 unit tests, plus the typecheck. New: `MonthField` (7 cases), `DateRangeFields` updated.
- `qa:e2e` 81/81.
- Audit at 1440×900 and Pixel 7, light and dark, on the Experience and Education steps and the
  export dialog: 0 contrast issues, 0 light patches, 0 console errors. The only flagged boxes are
  the inline "Save a copy" link (94×16) and a visually hidden 1×1 input, as before.
- Not changed: the photo crop dialog (plan item C), which was left out on request.
