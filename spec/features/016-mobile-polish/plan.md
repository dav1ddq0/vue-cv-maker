# 016 · Plan

## Approach

CSS-first, keeping the 013 components. Two breakpoints: ≤ 640px (phone shell, `useIsPhone`) and
641–1000px (two panes, no dock). The only new component is the menu sheet (reuses `BottomSheet`).

## Implementation

1. Spec, plan, tasks.
2. `AppHeader.vue`: on phones, one row with icon buttons and a menu button; new `AppMenuSheet.vue` (navigation, language, theme, storage note); i18n. `App.vue`: no persistence notice on phones in the editor.
3. `StepHeader.vue`: compact bar with previous / next; `MobileDock.vue`: one row.
4. `PreviewPane.vue`: no title row on phones, fit-to-width also in the 641–1000px column; dock only ≤ 640px.
5. 641–1000px layout in `App.vue` / `CvWizard.vue` (two columns, footer buttons back) and the short-landscape rules.
6. Sweep with Playwright at the widths above; close the spec.

## Decisions

- **Breakpoints stay 640 and 1000** (already used by 013); no new ones.
- **Menu sheet, not a hamburger drawer**: same `BottomSheet` as steps and sections, one pattern.
- **Storage notice moves, it is not removed**: the text is in the menu sheet and My CVs keeps its own note.
- **Preview column on tablets uses fit-to-width**, not the zoom slider (the slider stays at ≥ 1001px).

## Risks

- **Dock removed at 641–1000px**: Back / Next must reappear in the form footer or tablets lose navigation; covered by task 5.
- **Landscape phones (390px tall)**: the header and tab strip eat height; handled with `max-height` rules and checked in the sweep.
