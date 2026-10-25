# 026 · Bundled fonts

**Status:** planned, waiting for the dependency approval

## What it does

Ships the open-licence fonts the style step already offers, so a CV looks the same on every machine
and in every export, and embeds the chosen font in the standalone HTML.

## Why

- The font list offers Inter, Source Sans 3, JetBrains Mono and EB Garamond (and Carlito and Caladea as
  the stand-ins for Calibri and Cambria), and 11 of the 13 templates default to Inter or Source Sans 3,
  but the app loads none of them. Without them installed, the CV falls back to the system font:
  "Inter" and "Source Sans" look the same, and the PDF changes from one computer to the next.
- The UI itself asks for Inter (`--font-ui`) and gets the system font.
- The exported HTML can only show a font it carries: today it carries none.

## Acceptance criteria

- [ ] Inter, Source Sans 3, JetBrains Mono, EB Garamond, Carlito and Caladea load from the app's own
      origin (weights 400, 600, 700 and italic 400), with no request to a third party and the CSP as is
      (`font-src 'self' data:`).
- [ ] Every font in the style step that is not bundled is labelled as depending on the computer
      (Iowan Old Style, Calibri, Cambria, Helvetica, Palatino, Garamond…) or falls back to a bundled
      look-alike, never silently to something else.
- [ ] The PDF export waits for the fonts (`document.fonts.ready`) before opening the print dialog.
- [ ] The standalone HTML embeds the faces of the CV's font family as `data:` URLs (Latin and Latin
      Extended subsets only), and no other font.
- [ ] Stored font values do not change: no data model change, no migration.
- [ ] The production build stays within a stated budget: fonts are fetched only when a CV uses them.

## Out of scope

- Fonts beyond the current list; user-uploaded fonts.

## Verification

- Unit tests: the HTML export embeds the selected family and nothing else; the PDF path awaits fonts.
- Playwright: each bundled family renders with its own metrics (text width differs from the fallback),
  no request outside the origin, built site under the CSP; an exported HTML opened from disk shows the
  font.
