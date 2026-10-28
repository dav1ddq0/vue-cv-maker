# 031 · Direct PDF download

**Status:** implemented ✅

## What it does

A "Download PDF" button that saves `<name> – CV.pdf` straight away, without the system print dialog.
The PDF is built in the browser from the same paginated pages the print uses (paged.js), so all 13
templates keep their look, and the text stays real text: selectable, searchable, readable by ATS.
Nothing leaves the browser. Printing stays as it is, next to the new button.

Chosen by the user on 2026-10-28 over an image-based PDF (text not selectable), templates rewritten
for a PDF library or Typst (two copies of every template), and a server (data would leave the
browser). Browsers offer no API to turn HTML into a text PDF without the print dialog.

## How

1. Paginate as for printing (paged.js, off screen).
2. Read every page: each text line with its font, size, weight, colour and position
   (`Range.getClientRects`), every box background, border and rounded corner, the photo, the SVG
   marks (icons, level dots), and the links.
3. Draw the same on PDF pages with PDFKit, embedding the CV's font (subset), and add link
   annotations.

## Acceptance criteria

1. [x] "Download PDF" in the export step, the desktop export dialog and the phone export sheet; it
       saves `<name> – CV.pdf` (same name as `printTitle`), with a busy state.
2. [x] Same page count and page breaks as the printed PDF for every template (sample, long CV,
       manual page break).
3. [x] Text is real text: `pdftotext` of the download contains everything the printed PDF does.
4. [x] Looks like the print: an automated visual comparison against the printed PDF stays within a
       set threshold for all 13 templates; anything above it blocks the template from leaving beta.
       Threshold: 4 % of pixels differing (grey difference > 48) at 50 dpi; measured maximum 2.5 %.
5. [x] Fonts: bundled fonts are embedded (subset), Latin Extended included. System fonts ("según el
       equipo") cannot be read by a web page: they fall back to the nearest PDF standard font, and
       the button says so for those CVs.
6. [x] Links are clickable; the photo is embedded at its stored resolution.
7. [x] If anything fails, the user is offered the print path instead; nothing is lost.
8. [x] The libraries load only when the button is used (lazy chunk); the first load stays as it is.

## Verification

- 482 unit tests. New: colour, unicode-range and clip-path parsing; per-character face choice and
  the system-font fallback; SVG shape paths; a WOFF for each of the 44 faces; the export dialog
  downloads `<name> – CV.pdf` by default and closes, stays open with "Print instead" when the build
  fails, and names a system font it cannot embed; the phone sheet lists both PDFs.
- Converter against the printed PDF, 13 templates × sample, photo, long CV, page break (52 PDFs):
  same page count, 0 characters missing, at most 2.5 % of pixels differing (threshold 4 %); generated
  CVs with Latin Extended, quotes, markup as text and long words; links identical; system fonts in
  Times / Helvetica with bundled fallback for Ł, ř.
- Built site (production CSP), Chromium: the export step downloads "Nadia Martín Reyes – CV.pdf"
  with no print dialog (one page, Source Sans embedded); PDFKit is fetched only on that click; the
  desktop dialog preselects it, embeds the photo and closes; the phone sheet lists it first and
  closes after the download; no console errors. 0.5 s for a 2-page CV, 0.8 s for 7 pages; same page
  count as the print. First-load JS unchanged (87 KB gzip); PDFKit is a 215 KB gzip lazy chunk.
- The E2E suite: 81/81.

## Out of scope

- Removing the print path: it stays the reference output.
- Colour emoji (no font to embed): they are left out of the download, as the print keeps them.
