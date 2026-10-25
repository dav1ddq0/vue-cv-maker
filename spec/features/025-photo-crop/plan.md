# 025 · Plan

1. Spec, plan, tasks.
2. `src/core/photoCrop.ts`: pure geometry (cover scale, offset clamping, source rectangle, output size).
   `src/services/photoCrop.ts`: decode a Blob, rotate, draw the rectangle on a canvas, encode JPEG. Tests.
3. `PhotoCropDialog.vue` (native `<dialog>`): frame with pointer drag, wheel and keys, zoom slider,
   rotate, round guide; i18n. `StepPersonal` opens it on pick and from "Adjust". Tests.
4. Playwright check, roadmap, close.

## Decisions

- **Crop at upload, store only the result**: no model change, smaller storage and exports. The cost
  (re-adjusting cannot zoom out past the earlier crop) is stated in the spec.
- **Square output**: every template shows a square; one crop serves all of them.
- **800 px JPEG at 0.9**: about 4× the largest on-page size at 300 dpi; JPEG because it prints and
  embeds everywhere, painted on white first.
- **Geometry in `core/`**: the part with edge cases is pure and testable without a canvas.
- **Rotation by redrawing the source** into a rotated canvas, so the geometry only deals with an
  upright image.
