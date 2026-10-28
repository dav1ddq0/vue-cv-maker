# 030 · Plan

1. Spec, plan, tasks.
2. Zoom fix and M3 toolbar (items 5–6).
3. Expand / collapse (items 1–4).
4. Verify in Chromium at 1440 and 1920 px; roadmap; close.

## Decisions

- **Zoom fix**: the page is scaled from its top-left corner inside a frame sized to the scaled page
  (width = A4 × zoom, height = measured height × zoom), and the scroller centres with `safe center`.
  The layout box then matches what is seen, so the scroll range covers the whole page; the old
  bottom-margin compensation goes. CSS `zoom` would be simpler but is only newly Baseline.
- **State** in the `ui` store (`previewExpanded`), session only, effective only on desktop and in the
  editor view, so no stale layout survives a resize or a view change.
- **Rail**: `StepRail` gets a `compact` prop (badges only, names as `aria-label` and `title`), the
  M3 navigation-rail form of the same list. Picking a step there collapses the preview.
- **Esc** is handled with the app's other shortcuts in `App.vue`, ignored while a dialog is open.
