# 013 · Mobile experience

**Status:** implemented ✅

## What it does

On phone-sized screens (≤ 640px) the editor becomes a touch-first flow: one step per screen, the
primary actions in a bottom dock within thumb reach, a bottom sheet to jump between steps (with the
state of each), a sticky live preview while choosing template and style, and a full-screen preview
whose main action is "Download PDF". Desktop and tablet layouts do not change.

Design reference: the approved mock-up "CV Maker móvil" (6 artboards: My CVs, edit a step, step
picker, add section, template and style, preview and export).

## Why

The responsive review (010) made the desktop layout fit a phone, but it is still the desktop UI
squeezed: a horizontal tab strip of 9 steps, controls at the top, a preview hidden behind a toggle.
A phone needs the reverse: actions at the bottom, fewer things per screen, big targets.

## Acceptance criteria

- [x] ≤ 1000px (where the preview has no column of its own): bottom dock with the Edit / Preview switch and Back / Next, outside the form so preview mode keeps a way back; above 1000px nothing changes.
- [x] A step header ("Step 3 of 9 · Experience") with a segmented progress bar opens the step picker sheet.
- [x] The picker lists all 9 steps with their state (current, complete, incomplete, optional); computed by a pure, tested function.
- [x] Sheets are native `<dialog>` (focus trap, Esc, backdrop), close on backdrop tap and on the close button.
- [x] "Add section" opens the preset sheet (012) on phones.
- [x] Template and style: the preview stays visible while scrolling the controls; templates in a snap carousel.
- [x] Full-screen preview shows the page fitted to width with the PDF export (print dialog) as the primary action.
- [x] Every target ≥ 44px; no horizontal overflow at 320/360/390/430px; respects safe-area insets.
- [x] No new dependencies; existing keyboard and screen-reader behaviour is kept.

## Out of scope

- Redesign of tablet/desktop; gestures such as pinch-zoom or swipe between steps (later, if wanted).
- Native app, PWA install, offline caching changes.
- New fields or sections (014+).

## Verification (phase 9)

Sweep with Chromium (mobile emulation, touch) at 320, 360, 390 and 430px: the CV list, import, the nine
steps, the step sheet, the section sheet, the preview and the export sheet (60 audits).

- No horizontal overflow in any of them.
- Every interactive control of the app is ≥ 40px on both axes (≥ 44px for the ones this feature added).
  The sweep found and fixed: checkboxes/radios (the whole label is now the target and the box is 22px),
  range sliders (44px tall), and the remove button of tag chips (taller chips). Links inside the scaled
  CV preview are CV content, not controls, and are excluded.
- No console errors. A single 404 seen once at 320px did not reproduce on a plain load.

Bugs found on the way, both pre-existing: below 1000px the preview toggle lived inside the form that
hides in preview mode (no way back), and the grid column (`1fr`) grew to the A4 width and overflowed the
document.

Not covered: real devices (iOS Safari for the `dialog` fallback and `interactive-widget`, Android with the
keyboard open), and tablet widths 641–1000px keep the tab strip instead of the step header (the dock does
apply there).
