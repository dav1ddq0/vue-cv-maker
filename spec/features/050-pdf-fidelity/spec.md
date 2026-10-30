# 050 · The PDF download looks like the page

**Status:** implemented ✅

## What it does

Reported: with some templates the downloaded PDF is not the same as the web view, or lacks design
effects. The direct PDF (spec 031) redraws the paginated page with PDFKit and only paints what
`pdfDirect.ts` implements: background colours, borders and rounded corners, images, SVG shapes, text
and list bullets. Comparing it with Chrome's own print of the same page, and scanning every
template's computed CSS, found four causes:

1. **Fonts the page cannot read.** Georgia, Iowan Old Style, Times New Roman, Arial and Helvetica
   have no file to embed, so the PDF used the PDF standard Times or Helvetica: Monogram, Frame and
   Editorial, in their default fonts, went out in Times.
   Now the PDF draws them in a bundled stand-in with the same widths: **Gelasio** for Georgia and
   Iowan, **Tinos** for Times New Roman, **Arimo** for Arial and Helvetica (the same trick as Carlito
   for Calibri and Caladea for Cambria). The page keeps showing the system font; only the PDF uses
   the stand-in (`core/fontStandIns.ts`). The "depends on each computer" note in the export dialog no
   longer shows for these fonts; Palatino, Tahoma and Verdana still have none.
2. **An `<svg>` with a background or border was not drawn** (its CSS box was skipped): the discs and
   squares behind the contact icons of Cobalt and Monogram were missing. The box is now drawn first.
3. **`box-shadow` was ignored.** Solid, unblurred shadows (rings and offset copies) are now drawn
   under the box: the ring around Cobalt's photo and the white ring of Meridian's timeline dots.
   Blurred and inset shadows are still not drawn.
4. **`stroke-linecap`, `stroke-linejoin` and `vector-effect: non-scaling-stroke` were ignored**: the
   icon strokes went out with square ends, and Monogram's diagonal came out thinner.

Also: `lineJoin` added to the PDFKit type declaration (the method existed).

## Dependencies

`@fontsource/gelasio`, `@fontsource/arimo` and `@fontsource/tinos`, 5.3.0 exact (OFL), installed
with `--ignore-scripts`; 66 faces declared in `styles/fonts.css` (Latin and Latin Extended, 400 / 600 /
700 and italic 400, Tinos 400 / 700) with their WOFF twins in `pdfFonts.ts`.

## Acceptance criteria

1. [x] Every template, in its default font, goes out with embedded fonts (no PDF standard font).
2. [x] The contact icon discs, the photo ring and the round stroke ends are in the PDF.
3. [x] No template uses CSS the direct PDF cannot draw (gradients, blurred or inset shadows, filters,
   text shadows, underlines, outlines, mixed corner radii, non-string generated content): a check
   scans them all.

## Verification

- `qa:e2e` has a new `fidelity` block (118/118): it scans every template's CSS with a photo, and
  downloads its PDF in its own default font and lists the fonts. Mutation-tested: without the
  stand-ins it fails for Editorial, Frame and Monogram (Times); a gradient in Cobalt fails the scan.
- 650 unit tests (stand-ins, solid shadows, the export note), `vue-tsc`, `qa:pdf` 127/127,
  `qa:roundtrip` 420/420, `qa:security` 55/55. Rasterised and compared with the page: the icons,
  ring and serif now match.
- Not covered: Palatino, Tahoma and Verdana still use a PDF standard font in the download; blurred
  shadows would still be dropped if a template used one (the scan would say so).
