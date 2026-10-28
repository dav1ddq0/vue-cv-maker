# 028 · Plan

1. Spec, plan, tasks.
2. A · async races (items 1–3), with tests.
3. B · store actions for custom sections and page breaks (item 4), with tests.
4. C · `DateRangeFields` and `useModalDialog` (items 5–6).
5. D · Vue 3.5 idioms (items 7–10).
6. Verify on the built site; roadmap; close.

## Decisions

- **Races**: each async watcher run marks itself stale in `onCleanup` (the next run or unmount), the
  same idea as the request counters in `usePhotoThumb` and `PaginatedPreview`. Object URLs created by a
  stale run are revoked.
- **Store actions** keep the existing model: plain field edits still go through `v-model` on
  `cv.data` (the deep watcher makes them undoable). Only changes that must keep several fields in
  step become actions.
- **`useModalDialog(el, open)`** owns `showModal`/`close`; the components keep their
  own close handling (backdrop, confirm vs cancel).
- **Skill row keys**: `SkillItem` stays `{ name, level? }` (no schema change); the editor keeps a
  local array of keys parallel to the items, updated on add and remove.
