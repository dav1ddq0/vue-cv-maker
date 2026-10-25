# 026 · Bundled fonts

**Status:** implemented ✅

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

- [x] Inter, Source Sans 3, JetBrains Mono, EB Garamond, Carlito and Caladea load from the app's own
      origin (weights 400, 600, 700 and italic 400), with no request to a third party and the CSP as is
      (`font-src 'self' data:`).
- [x] Every font in the style step that is not bundled is labelled as depending on the computer
      (Iowan Old Style, Calibri, Cambria, Helvetica, Palatino, Garamond…) or falls back to a bundled
      look-alike, never silently to something else.
- [x] The PDF export waits for the fonts (`document.fonts.ready`) before opening the print dialog.
- [x] The standalone HTML embeds the faces of the CV's font family as `data:` URLs (Latin and Latin
      Extended subsets only), and no other font. (Measured: about 400 KB for four weights.)
- [x] Stored font values do not change: no data model change, no migration.
- [x] The production build stays within a stated budget: fonts are fetched only when a CV uses them.

### Found while checking
- [x] The PDF used the system font even with the fonts loaded on screen (the email measured 127.7 pt,
      Noto Sans' width, instead of Source Sans' 112.5 pt). paged.js re-declares every rule it is given
      in a sheet of its own; the copied `@font-face` URLs no longer resolved there and, being later,
      won. The CSS handed to paged.js now leaves `@font-face` out: the faces are already registered in
      the document.

## Out of scope

- Fonts beyond the current list; user-uploaded fonts.

## Verification

- 446 unit tests (new: `fonts.css` imports only Latin subsets of 400/600/700/italic; an option is
  marked bundled exactly when its stack names a shipped family; family-name parsing).
- Built site (`vite preview`, CSP active), Chromium:
  - The six families load (`document.fonts.check`) and each measures differently from the fallback.
    On load the page fetches only Inter (UI) and Source Sans 3 (Classic), Latin subsets.
  - No request outside the origin, no console error.
  - PDF (Exportar → Imprimir, `page.pdf`): Classic embeds Source Sans 3 only, Meridian with Inter
    embeds Inter, Calibri embeds Carlito; word widths match the bundled font.
  - Standalone HTML with Garamond: 8 EB Garamond faces inlined (400, 600, 700, italic × Latin and Latin
    Extended), no app font URL left, 518 KB in total; opened from disk it renders EB Garamond with no
    request.
- Build: 44 `.woff2` (1.4 MB) plus their `.woff` fallbacks are emitted; a browser fetches only the
  faces a page uses.
- `npm audit --omit=dev`: 0 vulnerabilities; the lockfile adds only the six packages.
- Not checked: Safari and Firefox print engines.
