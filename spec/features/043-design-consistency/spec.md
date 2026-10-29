# 043 · Design consistency: the tokens are what the interface uses

**Status:** implemented ✅ (the two items left for later were done in 045)

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
4. **Elevation** (phase 5): five drop shadows of their own (the preferences panel, the paper of the
   preview and of the paginated view, the strip's page, and the crop dialog's mask) are the tokens
   `--elevation-2/3` and the scrim colour. Rings and indicator lines (`0 0 0 2px`, `inset 0 -2px 0`)
   have no blur and are not elevation. A test fails on a blurred shadow that is not a token.
5. **The accent colour picker** (phase 7): a native `<input type="color">` with the browser's grey box
   next to round swatches. It is now one more round swatch, the size of the others (44 px on touch),
   with the chosen colour inside and a ring of every hue to say "any colour"; disabled it dims like
   the rest.

6. **A suite for it** (phase 8): `npm run qa:consistency` (also in `npm run qa`) repeats the audit in the
   browser over 68 views (desktop light and dark: the steps, the photo crop and export dialogs, the
   preferences, Import, My CVs, a blank CV for the empty states; a Pixel 7 profile: the nine steps and
   the menu) and fails on a text size or weight off the scale, a radius off the shape scale, a blurred
   shadow that is not an elevation token, an input in the browser's own grey, an element that sticks
   out of its box or scrolls sideways (the phone's template carousel is meant to), a BaseButton
   variant that looks different somewhere, and single-line fields of different heights. It found one
   more: a date field (58 px) and the two sliders (60 px) were taller than a text field (56 px), the
   first from the browser's own date control and the others from the default margin of a range input;
   a field's input is now `margin: 0; height: 56px`. The static guards (`tests/typeScale.test.ts`)
   catch the size, weight and shadow the moment they are written; the browser suite catches what
   only shows once styles cascade.

The title of a view and the padding off the 4 px grid, reported in the audit, were done in spec 045.

## Verification

_Per phase, below._

### Phase 1

- Audit after the change: every size of the interface is on the scale. What is left in the report is
  the CV paper that the phone preview draws (Source Sans 3), which is not the interface's.
- 591 unit tests (new `tests/typeScale.test.ts`, 3 cases; with a loose `em` put back it fails),
  typecheck, `qa:e2e` 96/96, the overflow detection over 9 steps × 6 widths × 2 themes finds nothing
  new, and screenshots of the steps, My CVs, the template gallery and the phone read the same with
  the type a point smaller where it inherited 15 px.

### Phases 3, 4, 5, 7 and 8

- 597 unit tests, `qa:e2e` 96/96, `qa:consistency` 9/9 over 68 views. Each guard was mutated: a loose
  `font-size`, an odd weight and a raw shadow fail the static tests; a font size, a taller field and a
  loose shadow in a view the suite visits fail the browser suite (a shadow in the preferences panel and
  a size in an empty state were missed until those views were added).
