# 045 · Consistency everywhere: view titles, the 4 px grid, a device matrix

**Status:** implemented ✅

## What it does

Closes the two items 043 left for later and widens the browser suite to every device class.

1. **One title for a view.** `.view-title` (app.css): 24 px, weight 700, line-height 1.25, no margin.
   Used by the wizard heading (desktop and tablet), My CVs and Import. Before: 24, 19.5, 15 and
   33 px. The phone's step bar (`StepHeader`) is an app-bar trigger, not a title, and keeps its
   compact 14 px.
2. **Spacing on the 4 px grid.** About 200 `padding`/`margin`/`gap` declarations moved to multiples
   of 4 (hairlines of 2 px or less kept; 1.5–3 px became 2 px). `em` spacing is gone, and eight
   `calc`/`clamp` cases were converted by hand. `tests/spacingGrid.test.ts` is the static guard.
3. **A button radius that follows its variant.** The phone's "New CV" / "Load sample" / "Import"
   calls to action in My CVs overrode the radius to 16 px; every `BaseButton` is a pill again.
4. **The browser suite (`qa/consistency.cjs`) runs on a matrix.** Laptop 1280×800, desktop 1440×900
   and 1920×1080, iPad portrait and landscape, iPad Pro 11, Pixel 7, iPhone SE and a 360×640 phone,
   in light and dark. It walks the welcome screen, the nine steps, the preview, the crop dialog,
   export, Preferences, Import, My CVs and a blank CV: 292 views per run (about 2 minutes).
   The sideways-scrolling strips (`ol.steps`, `ul.templates`) are allowed; the check "variants look
   the same" now says where they differ.

## Acceptance criteria

1. [x] A view title is 24 px / 700 on every view of every profile.
2. [x] No spacing declaration is off the 4 px grid, and none uses `em`.
3. [x] A `BaseButton` variant looks the same wherever it appears.
4. [x] `npm run qa:consistency` passes 10/10 on the whole matrix.

## Verification

- Suite: 10/10 over 292 views. Its first run found 276 sideways-scroll hits (intended strips), the
  button radius above and the phone step bar (by design); the rules were tightened for the first and
  third, the code for the second.
- 598 unit tests, `vue-tsc` clean, `qa:e2e` 96/96, `qa:pdf` 111/111.
- The grid guard was mutation-tested (a `13px` padding and an `em` gap both fail it).
