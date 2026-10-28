# 028 · Vue best-practices pass

**Status:** in progress 🚧

## What it does

Applies what the Vue best-practices audit of 2026-10-26 found (the `vue-best-practices` skill:
reactivity, SFC, component data flow, composables). No visible change to the app, except the two
fixes in A.

## Acceptance criteria

### A · Async races

1. [ ] **The preview shows the template last picked.** `CvRenderer` keeps only the latest template
       load: an older, slower load resolving later no longer replaces it.
2. [ ] **No photo URL outlives the renderer.** A photo load still pending when the photo changes or the
       renderer unmounts revokes its object URL instead of showing or leaking it.
3. [ ] **The crop dialog frames the photo last given.** A decode still pending when another photo
       arrives is dropped.

### B · CV invariants in the store

4. [ ] Adding or removing a custom section and toggling a page break are `cv` store actions
       (`addCustomSection`, `removeCustomSection`, `setPageBreak`): `sectionOrder` and `pageBreaks`
       stay consistent with `customSections` wherever the change comes from. `StepCustom` calls them.

### C · Shared pieces

5. [ ] **`DateRangeFields`**: start, end and "currently here" fields, used by Experience and Education
       instead of two copies.
6. [ ] **`useModalDialog`**: the `open` prop ↔ native `<dialog>` sync, used by `BottomSheet`,
       `ExportDialog` and `PhotoCropDialog`.

### D · Vue 3.5 idioms

7. [ ] Template refs with `useTemplateRef()` instead of `ref<HTMLElement | null>(null)`.
8. [ ] `v-model` components (`TagInput`, `SkillItemsEditor`, `LanguageLevelPicker`) with
       `defineModel()`.
9. [ ] `SkillItemsEditor` rows keyed by a stable per-row key, not the index: removing a middle row
       does not move focus or field state to its neighbour.
10. [ ] No branching or list derivation inline in component templates (`PdfReview` nested ternary,
        `ExportSheet` ternary, `StepCustom` reorder `map`).

## Out of scope

- Template markup duplication across the 14 templates: a feature of its own.
- `shallowRef` for every primitive and a shared `matchMedia` listener: negligible gain for the churn.
- `immediate: true` instead of `onMounted` + `watch` in `BottomSheet`/`WizardNav`: the immediate run
  happens during setup, before the template ref exists.
