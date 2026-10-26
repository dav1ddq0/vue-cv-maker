# 027 · Plan

1. Spec, plan, tasks.
2. Items 1–5, with tests.
3. Re-run the functional review on the built site; close.

## Decisions

- **Blank CV**: `startBlank` calls `cv.createNew()` (stored at once) instead of only navigating; the
  empty document the app opened on first run is never stored, so nothing is duplicated.
- **Remove names**: `aria-label` built from the visible word plus the item name, so the visible label
  stays inside the accessible name (WCAG 2.5.3).
