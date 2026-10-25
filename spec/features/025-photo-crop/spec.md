# 025 · Photo crop and zoom

**Status:** implemented ✅

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

- [x] Picking a photo opens the crop dialog; "Use photo" stores the cropped square, "Cancel" stores
      nothing and keeps the previous photo.
- [x] The image always covers the square: zoom goes from "fits the short side" (1×) to 4×, moving
      stops at the edges.
- [x] Drag with mouse, finger or pen; arrow keys move it when the frame has focus, `+`/`-` zoom; the
      slider has a label; rotate turns 90° clockwise.
- [x] A round guide shows what the round templates keep.
- [x] The result is a JPEG of at most 800 × 800 px (never upscaled), on white, so a transparent PNG does
      not turn black.
- [x] "Adjust photo" on an existing photo opens the dialog with it; the result replaces it.
- [x] No data model change: the photo reference stays `photo:{id}`.

### Found while checking
- [x] A replaced photo kept showing the old picture in the preview until a reload: it was saved under
      the same `photo:{cvId}` key, so the CV's reference never changed. Each version now has its own key
      (`photo:{cvId}:{version}`) and the replaced blob is deleted. Older `photo:{cvId}` references
      still load.
- [x] The button is "Adjust photo": a bare "Adjust" clashed with the preview's fit button.

## Out of scope

- Keeping the uncropped original (adjusting re-crops the stored square, which can only zoom further in).
- Filters, brightness, background removal.

## Verification

- 443 unit tests (new: crop geometry; the dialog's starting crop, slider and keys zoom, arrow keys
  stopping at the edge, the quarter turn, cancel; the photo field storing only the confirmed crop and
  nothing on cancel). jsdom has no canvas, so drawing and encoding are mocked there.
- Playwright, Chromium, 1440×900 and 390×844: a 1200×1600 PNG zoomed to 1.6× and moved (mouse drag on
  desktop, arrow keys on the phone) was stored as a 750×750 JPEG of 12 KB; "Adjust photo" + rotate
  stored a new key, deleted the old blob and refreshed the preview at once. No horizontal overflow, no
  console errors.
- Not checked: real touch drag on a device, Safari and Firefox (`createImageBitmap` with
  `imageOrientation` is supported in both, but untested here), EXIF-rotated phone photos.
