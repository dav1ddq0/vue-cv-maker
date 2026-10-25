# 024 · PDF file name and print guidance

**Status:** implemented ✅

## What it does

When the PDF export opens the browser's print dialog, the suggested file name is the CV owner's name
("Nadia Martín Reyes – CV.pdf") instead of the app's title ("CV Maker.pdf"), and the export screens say
which file name to expect and that the browser remembers "Save as PDF" as the destination.

## Why

- The user asked whether the PDF could download directly, without the print dialog. A browser cannot
  save a PDF without that dialog; the alternatives were weighed (rasterised PDF, which ATS cannot read;
  re-implementing 13 templates in a PDF library; a server, out of scope for v1) and the user chose to
  keep the dialog and make it smoother.
- Browsers name the saved PDF after `document.title`, which was always "CV Maker", so every CV was
  saved under the same name.

## Acceptance criteria

- [x] While printing, `document.title` is `"<full name> – CV"`; with no name, the document title; with
      neither, `"CV"`. Characters not allowed in file names (`/ \ : * ? " < > |`) are dropped. The
      original title is restored afterwards, also when printing fails.
- [x] The export dialog (desktop), the Export step and the phone export sheet say the file name and
      that the browser remembers "Save as PDF".

## Out of scope

- Generating the PDF without the print dialog (see Why).

## Verification

- 431 unit tests (new: the title rules and dropped characters; the title during and after printing,
  and after `window.print()` throws).
- Dev server, sample CV, Exportar → Imprimir: `document.title` was "Nadia Martín Reyes – CV" when
  `window.print()` ran and "CV Maker" afterwards; the dialog note names "Nadia Martín Reyes – CV.pdf".
  No console errors.
- Not checked: the name each browser's own save dialog actually shows (headless Chromium has none).
