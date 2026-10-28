# 031 · Direct PDF download

**Status:** in progress 🚧

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
3. Draw the same on PDF pages with pdf-lib, embedding the CV's font (subset), and add link
   annotations.

## Acceptance criteria

1. [ ] "Download PDF" in the export step, the desktop export dialog and the phone export sheet; it
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
7. [ ] If anything fails, the user is offered the print path instead; nothing is lost.
8. [ ] The libraries load only when the button is used (lazy chunk); the first load stays as it is.

## Out of scope

- Removing the print path: it stays the reference output.
- Colour emoji (no font to embed): they are left out of the download, as the print keeps them.
