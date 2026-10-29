# 040 · PDF import recovers more of the CV

**Status:** in progress

## What it does

The round trip of spec 037 (`qa:roundtrip`) showed that importing the PDF the app itself downloads
rebuilds the sections badly, and very unevenly by template. This spec improves the heuristics in
`services/pdfImport/` where the cause is understood, measured on those 26 PDFs (13 templates, direct
and printed). The score counts, per PDF, how many of four numbers come out exact: experiences (2),
education (1), skill items (12), languages (3). Baseline: **24 of 104**.

Causes found by dumping what the extraction returns for each PDF:

1. **Headings in pieces.** Tracked-out capitals reach the extraction as "RE SUMEN", "EXPE RI
   ENCIA": no keyword matches, so a printed Classic, Facet, Ledger, Meridian or Modern had no
   sections at all.
2. **Unknown sections swallow their lines.** A custom section's heading ("CHARLAS") was not read as
   a heading, so its lines went to the language list above it.
3. **Columns merged into one line.** A sidebar and a main column at the same height became one line
   ("Francés Grado en Ingeniería Informática"), and the reading order interleaved them.
4. **Skills laid out as a category line followed by its items** are not understood.

## Not in scope

- Bold detection: pdf.js gives an internal font id, not the font's name, so `bold` is never set.
- A scanned PDF (no text layer) is still refused.

## Acceptance criteria

_To be filled in as the phases land._

## Verification

_To be filled in as the phases land._
