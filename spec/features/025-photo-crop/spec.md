# 025 · Photo crop and zoom

**Status:** in progress

## What it does

After picking a photo, a dialog lets the user frame it: drag to move it, a slider (and the mouse wheel)
to zoom, a button to rotate it a quarter turn. The square they see is what every template shows. The
same dialog opens for the current photo from an "Adjust photo" button. P2 in the 011 gap analysis
("crop/zoom/rotate").

## Why

- Templates show the photo as a square (round or with rounded corners) with `object-fit: cover`, so a
  portrait-format phone picture gets its centre cut, often the forehead and chin, with no way to fix it.
- The stored photo is the full original (up to 5 MB, spec 020) while templates show it a few
  centimetres wide: a cropped 800 px square is a fraction of the storage and of the exported file.

## Acceptance criteria

- [ ] Picking a photo opens the crop dialog; "Use photo" stores the cropped square, "Cancel" stores
      nothing and keeps the previous photo.
- [ ] The image always covers the square: zoom goes from "fits the short side" (1×) to 4×, moving
      stops at the edges.
- [ ] Drag with mouse, finger or pen; arrow keys move it when the frame has focus, `+`/`-` zoom; the
      slider has a label; rotate turns 90° clockwise.
- [ ] A round guide shows what the round templates keep.
- [ ] The result is a JPEG of at most 800 × 800 px (never upscaled), on white, so a transparent PNG does
      not turn black.
- [ ] "Adjust photo" on an existing photo opens the dialog with it; the result replaces it.
- [ ] No data model change: the photo reference stays `photo:{id}`.

## Out of scope

- Keeping the uncropped original (adjusting re-crops the stored square, which can only zoom further in).
- Filters, brightness, background removal.

## Verification

- Unit tests: the crop geometry (cover scale, clamping, source rectangle, rotation, output size).
- Component tests: the dialog's controls, cancel and confirm, the field opening it (canvas mocked:
  jsdom has none).
- Playwright: a portrait test image cropped off-centre, the stored blob's size and dimensions, and the
  preview showing it; desktop and phone screenshots.
