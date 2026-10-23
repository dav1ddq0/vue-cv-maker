# 013 · Plan

## Approach

Phase by phase, one commit each, behind a single `≤ 640px` media query (`useMediaQuery`-style
composable for the places that need to branch in script). The desktop components stay as they are;
mobile-only pieces are new small components.

## Implementation

1. `composables/useIsPhone.ts` (matchMedia, SSR/test safe) and safe-area CSS tokens.
2. `core/stepStatus.ts`: pure `stepStatus(data, id)` → `current | complete | incomplete | optional` + tests.
3. `components/form/StepHeader.vue` (progress bar + opens picker) and `StepSheet.vue` (`<dialog>`), replacing the tab strip on phones.
4. `components/form/MobileDock.vue`: Edit/Preview switch + Back/Next, wired to `ui.step` / `ui.previewOpen`.
5. Section picker as a sheet on phones (reuses `SECTION_PRESET_IDS`).
6. Style step: sticky mini preview and snap carousel in `TemplateGallery.vue`.
7. Full-screen preview: fit-to-width page, "Download PDF" primary, export options in a sheet.
8. My CVs: card layout with thumbnails, primary "New CV" in the dock.
9. Sweep 320–430px × all views; record in spec.

## Decisions

- **Native `<dialog>` for sheets**: focus trap, Esc and top layer for free; no library.
- **One breakpoint (640px)** for the phone shell; the existing 480px rules stay as refinements.
- **Status per step is derived, never stored**: no schema change.
- **Static mock-up thumbnails are not reused**: real templates render the preview.

## Risks

- **Scope**: nine phases; each ships on its own and leaves the app working.
- **Sheet a11y**: test focus return and Esc in jsdom plus a manual pass.
- **Keyboard covering the dock**: use `dvh` and `interactive-widget` so the dock follows the visual viewport.
