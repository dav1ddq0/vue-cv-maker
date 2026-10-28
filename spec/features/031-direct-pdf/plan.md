# 031 · Plan

1. Spec, plan, tasks. The user installs `pdf-lib@1.17.1` and `@pdf-lib/fontkit@1.1.1`.
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
- **pdf-lib** (MIT, no native dependencies). Last release 2022: stable and widely used, but
  unmaintained — the converter isolates it in `services/export/pdfDirect/` behind one function, so it
  can be swapped (jsPDF 4 is the fallback candidate).
- **Fonts from the `.woff` files** Fontsource ships (`@pdf-lib/fontkit` reads WOFF, not WOFF2); one
  embedded font per subset file, and each text run is split by which file covers its characters.
- **Visual comparison** with `pdftoppm` renders of both PDFs and a per-pixel difference, in the
  scratch QA tooling (not a unit test): it needs Chromium's print to PDF as the reference.
