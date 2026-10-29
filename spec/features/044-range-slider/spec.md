# 044 · A slider that looks like the rest of the app

**Status:** implemented ✅

## What it does

Reported from a phone screenshot (it happens on desktop and iPad too): the "Font size" and "Spacing"
fields of the Template and style step looked bad. They were the browser's own `<input type="range">`
in a field: the track ran edge to edge, flush with the field's border and not with its label; on iOS
the thumb is an oval pill; the field was 4 px taller than the text fields (the default margin of a
range input) and, on a phone, left a blank band under the track.

`RangeSlider.vue` draws a Material 3 slider and keeps the native input for its behaviour (keyboard,
drag, assistive technology, form value):

- a 4 px track, filled with the primary colour up to a 20 px round thumb, on the outline-variant;
- a halo around the thumb on hover, focus and drag (the state-layer opacities);
- the track starts under the label's left edge, the thumb stays inside the field's padding;
- 48 dp tall to touch where the pointer is coarse (phone, iPad), the track and thumb unchanged;
- disabled dims like the other controls (thumb 38 %, track 12 %);
- the same in WebKit and Firefox (`::-moz-range-progress` fills the track there).

The field's label still shows the value ("Tamaño de letra · 1.00×"); the slider carries only its name.

## Acceptance criteria

1. [x] Both sliders of the style step are `RangeSlider`s; their values and limits are unchanged.
2. [x] On desktop the field is 56 px like every text field (`qa:consistency`); on touch it is 80 px.
3. [x] The thumb is round on every platform.

## Verification

- 597 unit tests; `tests/rangeSlider.test.ts` (4 cases: the native input and its limits, the model
  in both directions as a number, the fill ratio kept between 0 and 1, disabled). Without the clamp it
  fails.
- `qa:e2e` 96/96, `qa:consistency` 9/9 over 68 views.
- Screenshots on desktop (light, dark) and a Pixel 7 profile.
- Not covered: a real iOS Safari. The track and thumb use `::-webkit-slider-*`, which iOS draws, but
  its pill came from the unstyled `appearance` and I could not run it.
