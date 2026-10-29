# 038 · Desktop polish: dates, lighter fields, export contrast

**Status:** in progress

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
   - The container fill goes from `surface-container-highest` to `surface-container`, hover and
     disabled included.
   - Highlights (`TagInput`) become rows with a divider, like the skills in `SkillItemsEditor`,
     instead of outlined chips.
3. **D · Export contrast.** The "Before you export" block gets a container that reads against the
   dialog in both themes.

## Acceptance criteria

1. [ ] The experience and education dates have no native month input; a year alone is accepted.
2. [ ] The month names follow the UI language.
3. [ ] Fields and highlights are lighter in light and dark, with 0 contrast issues in the audit.
4. [ ] The "Before you export" block is distinguishable from the dialog in dark.

## Verification

_To be filled in when implemented._
