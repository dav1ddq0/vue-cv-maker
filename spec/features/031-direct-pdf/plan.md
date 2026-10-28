# 031 · Plan

1. Spec, plan, tasks. `pdfkit@0.20.2` installed (exact).
2. **Spike** on Classic: text lines, fonts, colours, rules. Compare with the printed PDF (page count,
   `pdftotext`, pixel difference). Go / no-go with numbers before going further.
3. **Converter**: backgrounds and borders (rounded), images (photo), SVG marks, links, letter-spacing
   and uppercase, Latin Extended glyphs across the latin / latin-ext font files.
4. **All templates**: visual comparison for 13 templates × sample / long / page break; fix until
   within threshold, or keep a template in beta.
5. **UI**: the button in export step, dialog and sheet; busy state; fallback to print; system-font
   note.
6. Verify, roadmap, close.

## Decisions

- **Source of truth is the paginated DOM**, not the CV data: one layout engine (the browser +
  paged.js) for screen, print and download, so templates are written once.
- **PDFKit 0.20** (MIT, maintained, 2026), chosen by the user over pdf-lib (unmaintained since
  2022), its fork `@cantoo/pdf-lib` and jsPDF (TTF only). Its browser ESM build imports no Node
  modules; it is isolated in `services/export/pdfDirect.ts` behind `buildDirectPdf`.
- **Fonts from the `.woff` files** Fontsource ships next to each WOFF2: fontkit's subsetter fails on
  every WOFF2 we bundle ("Offset is outside the bounds of the DataView", checked on all four
  families) and subsets WOFF to 3–4 KB. `pdfFonts.ts` imports them as URLs, generated from
  `fonts.css`. One embedded font per subset file; each run is split by the file covering it.
- **Baselines are measured**, not derived from font metrics: a zero-size inline-block probe gives
  each element's baseline. **Each run is scaled to the width the browser gave it** (±15 %), so
  glyph-advance differences between engines cannot open gaps between words.
- **Generated content** (`::before`/`::after`) becomes real spans with the same computed style on a
  private copy of the pages (a copy, because paged.js re-lays out pages whose size changes).
- **List bullets** are drawn as Chrome draws them, not as "•": round(ascent/3) px across, d + 6 px
  before the text, centred d − 0.5 px above the baseline (measured at 10–100 px and on the PDF).

## Spike result (Classic, then all templates, sample CV)

- Same page count as the print for all 13; `pdftotext` of the download contains every character the
  printed PDF does (0 missing); 0.2–3 % of pixels differ at 50 dpi, except Chevron (14 %: its
  clip-path header). 230–530 ms per CV; 20–30 KB per PDF.
- Then missing: the Chevron header and Facet corners (inline SVG), Harbor's level stars (boxes cut by
  `clip-path: polygon()`, not a ★ glyph), the opacity of the "off" level marks, the photo.

## Converter result (13 templates × sample, photo, long CV, page break = 52 PDFs)

- Same page count as the print in all 52; 0 characters missing; at most 2.5 % of pixels differ
  (threshold 4 %). 230–650 ms per CV; 20–43 KB per PDF (the photo adds ~17 KB).
- Generated CVs: Latin Extended inside a word (Żółkiewski-Dvořák) splits across the latin and
  latin-ext files; «», €, `<b>` as literal text and a 70-letter word come out as text; links equal
  the print's. Only the colour emoji is left out, as specified.
- System fonts (Georgia, Arial): PDF standard Times / Helvetica, positions kept by the width
  matching (diff 1.8 %); characters WinAnsi lacks (Ł, ř) take EB Garamond or Source Sans instead of
  disappearing.
- **Visual comparison** with `pdftoppm` renders of both PDFs and a per-pixel difference, in the
  scratch QA tooling (not a unit test): it needs Chromium's print to PDF as the reference.
