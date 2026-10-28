# 028 · Vue best-practices pass

**Status:** implemented ✅

## What it does

Applies what the Vue best-practices audit of 2026-10-26 found (the `vue-best-practices` skill:
reactivity, SFC, component data flow, composables). No visible change to the app, except the two
fixes in A.

## Acceptance criteria

### A · Async races

1. [x] **The preview shows the template last picked.** `CvRenderer` keeps only the latest template
       load: an older, slower load resolving later no longer replaces it.
2. [x] **No photo URL outlives the renderer.** A photo load still pending when the photo changes or the
       renderer unmounts revokes its object URL instead of showing or leaking it.
3. [x] **The crop dialog frames the photo last given.** A decode still pending when another photo
       arrives is dropped.

### B · CV invariants in the store

4. [x] Adding or removing a custom section and toggling a page break are `cv` store actions
       (`addCustomSection`, `removeCustomSection`, `setPageBreak`): `sectionOrder` and `pageBreaks`
       stay consistent with `customSections` wherever the change comes from. `StepCustom` calls them.

### C · Shared pieces

5. [x] **`DateRangeFields`**: start, end and "currently here" fields, used by Experience and Education
       instead of two copies.
6. [x] **`useModalDialog`**: the `open` prop ↔ native `<dialog>` sync, used by `BottomSheet`,
       `ExportDialog` and `PhotoCropDialog`.

### D · Vue 3.5 idioms

7. [x] Template refs with `useTemplateRef()` instead of `ref<HTMLElement | null>(null)`.
8. [x] `v-model` components (`TagInput`, `SkillItemsEditor`, `LanguageLevelPicker`) with
       `defineModel()`.
9. [x] `SkillItemsEditor` rows keyed by a stable per-row key, not the index: removing a middle row
       does not move focus or field state to its neighbour.
10. [x] No branching or list derivation inline in component templates (`PdfReview` nested ternary,
        `ExportSheet` ternary, `StepCustom` reorder `map`).

## Out of scope

- Template markup duplication across the 14 templates: a feature of its own.
- `shallowRef` for every primitive and a shared `matchMedia` listener: negligible gain for the churn.
- `immediate: true` instead of `onMounted` + `watch` in `BottomSheet`/`WizardNav`: the immediate run
  happens during setup, before the template ref exists.

## Verification

- 457 unit tests. New: the three races (each fails on the previous code), the custom-section store
  actions, `DateRangeFields`, `useModalDialog`, stable skill-row keys (fails with index keys). One
  expectation changed: with `defineModel` and no parent bound, `SkillItemsEditor` keeps an edit locally,
  as a real `v-model` parent does.
- The functional review re-run on the built site (Chromium): main flow 19, custom sections 17, style/
  export/import 16, phone 10, overflow sweep 6 and wide-screen Fit 3 checks pass, with no console
  errors. The one failure on the first run was the script's "+" locator hitting "Undo (Ctrl+Z)"; it now
  clicks "Acercar" by name (70 % → 80 %).
- The browser-print PDF (`printCv` with paged.js, then Chromium's print-to-PDF): 14 templates × sample,
  long CV and a manual page break, 42 runs: paged.js and PDF page counts agree, no blank pages, the
  break lands where set, no errors.
- Photo crop flow (desktop and phone): dialog opens, stores a 750 × 750 JPEG, "Adjust photo" replaces
  the reference, no errors.
