# 049 · Monogram, a diagonal two-tone header with initials or a photo

**Status:** implemented ✅

## What it does

A new template, **Monogram**, laid out like a reference the user shared (a serif résumé with a
two-tone square at the top left): original code and tints, no assets taken from it.

- A header of two tones: a square block cut by a diagonal (dark upper left, the accent lower right),
  with a white frame holding the **initials** (first letter of the first name and of the last
  surname, one in each corner, a diagonal between them) — or, when there is a photo, the photo in
  the same frame. Beside it, over a pale tint: the name, the headline in italics, and the summary
  under a thin rule with its heading.
- A pale sidebar with contact (small square icons: e-mail, phone, location, and **LinkedIn / GitHub /
  any other link each with its own glyph**), skills and languages. The career, with education, in
  the main column; entry titles in bold italics.
- Serif by default (Georgia), navy-blue accent `#0a6bbd`; the accent colour picker and the font
  select of the style step apply as in any template (`accentColor`, `customFont`). The block's two
  tones, the tint and the icons are all derived from the accent, with the text in ink.

## Changes beside the template

- `templates/contactIcons.ts`: the contact glyphs and the choice of icon, shared by Cobalt and
  Monogram (Cobalt had its own copy). `linkKind(url)` picks LinkedIn or GitHub by hostname (a
  lookalike host such as `github.com.evil.example` gets the globe); the GitHub one is the branch
  glyph, not a company logo.
- The accent picker already existed for every template that supports `accentColor`; the nine
  swatches of the reference are not added to the shared palette.

## Decisions found on the way

- Education in the main column, as in Cobalt (paged.js drops what follows an overflowing sidebar).
- The diagonal is two solid shapes (a dark square and an accent triangle), not a gradient: the
  direct PDF draws background colours and SVG shapes, not gradients (`qa:pdf` showed 6–10 %
  differences with a gradient).
- The summary keeps a small heading in the header, and the sidebar is 37 % wide: without the
  heading the PDF import lost the summary, and at 35 % the e-mail wrapped and was not recovered.

## Acceptance criteria

1. [x] It registers itself and shows in the gallery with a thumbnail.
2. [x] Without a photo it shows the initials; with one, the photo in the same frame; with an empty
   name, no frame.
3. [x] LinkedIn, GitHub and other links each get their own icon, in Cobalt and Monogram.
4. [x] Its PDF (direct and print) matches the paged preview and imports back complete
   (`qa:roundtrip` 420/420, `qa:pdf` 127/127).

## Verification

- 631 unit tests (`monogramTemplate.test.ts`: initials, icon kinds, link hosts, with / without photo,
  columns, empty name), `vue-tsc`, `qa:e2e` 115/115, `qa:consistency` 10/10, `qa:roundtrip` 420/420,
  `qa:pdf` 127/127. Rendered with the sample CV with and without a photo.
