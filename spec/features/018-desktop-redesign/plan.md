# 018 · Plan

## Approach

Desktop-only (`min-width: 1001px`) additions on top of the existing components; the phone (≤ 640px)
and tablet (641–1000px) shells from 013/016 stay as they are. One reusable `useIsDesktop` query, new
components only where a responsibility is new (rail, export dialog, preferences popover, entry card).

## Implementation

1. Spec, plan, tasks.
2. `StepRail.vue` + three-column grid in `App.vue`; `CvWizard.vue` step heading (eyebrow, intro) and named footer on desktop; storage notice out of the desktop editor.
3. `AppHeader.vue` desktop: brand mark, breadcrumb, save state in words, icon undo/redo, Import, `PreferencesPopover.vue`, Export button.
4. `ExportDialog.vue` (native `<dialog>`), opened from the header and from the export step.
5. `EntryCard.vue` (collapsible) in experience and education; summary length meter.
6. Preview toolbar: template chip and zoom buttons.
7. My CVs: new-CV tile and search.
8. Sweep (1024–1920px, phone and tablet regression) and close.

## Decisions

- **Breakpoint 1000px** stays the desktop limit (already used for the preview column).
- **Native `<dialog>` for export, `popover` attribute for preferences**: focus handling and Esc for free; same approach as `BottomSheet`.
- **Collapse state is UI state, not CV data**: kept in the component, never persisted.
