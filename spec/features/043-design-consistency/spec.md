# 043 · Design consistency: the tokens are what the interface uses

**Status:** in progress

## What it does

An audit of 50 views (9 steps, welcome, My CVs, Import, the export dialog and the preferences in
desktop; 9 steps and welcome on a Pixel 7 profile; light and dark) compared the computed style of every
element of the interface with the design tokens. Shapes (radius), fields and colours were already on
the scale. These were not, and are fixed one phase at a time, each its own commit:

1. **Type scale.** About 25 text sizes outside the `--type-*` scale (15, 12.75, 12.3, 11.7, 11.25,
   10.5, 14.25, 16.5, 13.5 px…): 73 `font-size` declarations in `em` over a 15 px base from before spec
   029. Each is now `var(--size-N)`, one of the nine sizes of the scale (11, 12, 14, 16, 22, 24, 28, 32,
   36), the nearest to what it rendered; the base of the page is 14 px (M3 body medium). An
   unrecognisable `1em` stays: it inherits. A test fails on any `font-size` in the interface that is
   not a token, so the scale does not erode again.
2. **Buttons** (phase 3): the primary and secondary buttons of the export dialog were a style of their
   own (42 px, radius 16, weight 600), and the photo crop dialog had another (40 px, radius 16,
   weight 600), next to the page's `.btn` (40 px, pill, weight 500). Both dialogs now use `BaseButton`
   (primary, secondary), with its disabled state, and their own button CSS is gone. The remove icons
   of the highlights and the skills were 14 or 16 px by what they inherited and are 14 px. `.action`
   of the preferences and `.action` of the phone dock only share a name (a compact action and a 56 px
   bar), and stay.
3. **Weights** (phase 4): 550 (StepCustom) and 650 (CvWizard, PdfReview), which a variable font renders
   as in-between weights, are 500 and 600. A test fails on any other weight in the interface.
4. **Elevation** (phase 5): loose shadows next to `--elevation-1…3`.
5. **The accent colour picker** (phase 7): a native `<input type="color">` with the browser's grey.

Left for later, reported in the audit: a common rule for the title of a view (24, 19.5, 15 and 33 px
today) and the padding that is off the 4 px grid (from the same `em` units).

## Verification

_Per phase, below._

### Phase 1

- Audit after the change: every size of the interface is on the scale. What is left in the report is
  the CV paper that the phone preview draws (Source Sans 3), which is not the interface's.
- 591 unit tests (new `tests/typeScale.test.ts`, 3 cases; with a loose `em` put back it fails),
  typecheck, `qa:e2e` 96/96, the overflow detection over 9 steps × 6 widths × 2 themes finds nothing
  new, and screenshots of the steps, My CVs, the template gallery and the phone read the same with
  the type a point smaller where it inherited 15 px.
