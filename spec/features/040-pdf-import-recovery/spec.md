# 040 · PDF import recovers more of the CV

**Status:** implemented ✅

## What it does

The round trip of spec 037 (`qa:roundtrip`) showed that importing the PDF the app itself downloads
rebuilds the sections badly, and very unevenly by template. This spec improves the heuristics in
`services/pdfImport/` where the cause is understood, measured on those 26 PDFs (13 templates, direct
and printed). The score counts, per PDF, how many of four numbers come out exact: experiences (2),
education (1), skill items (12), languages (3). Baseline: **24 of 104**.

Causes found by dumping what the extraction returns for each PDF, and what changed:

1. **Headings in pieces.** Tracked-out capitals reach the extraction as "RE SUMEN", "EXPE RI
   ENCIA": no keyword matches, so a printed Classic, Facet, Ledger, Meridian or Modern had no
   sections at all. A heading in capitals is now also matched with its letters run together.
2. **Unknown sections swallowed their lines.** A custom section's heading ("CHARLAS") was not read
   as a heading, so its lines went to the language list above it. An unknown heading is now a short
   line in capitals, larger than the text or set apart from it (a page break counts), and in the
   type size of the headings that are known. The last condition matters on real CVs: without it
   every acronym of a list of skills set in capitals split its section.
3. **Columns merged into one line, and read interleaved.** A line is now cut into cells at a gap of
   more than two font sizes, and `readingOrder` (new `layout.ts`, a pure module) reads the cells of
   a page column by column, the column with the largest type first. Columns are found as gutters no
   body text crosses; they need flowing text (several cells a line or two apart), and either several
   headings each or two headings side by side on one row. The last rule keeps tables of labels and
   values (Compact, Ledger, Editorial, and a real CV with dates on the left) in plain top to bottom
   order. A page whose columns cover only part of it (a languages column beside a skills column
   under a full-width summary) is read in bands.
4. **Entries put together from several cells.** A title over "Company · dates · Place", a date in its
   own cell on the title row, and a smaller line under the title (company and place, or the
   institution of a degree) are one entry. A degree is no longer cut at the "en" of "Grado en…".
   Lines set in from the title are the highlights: a bullet drawn as a shape leaves no character,
   so the indent is the signal, and a line that wraps continues the highlight above it.
5. **Skills and languages.** A category set a little smaller than its items, labels in a column of
   their own beside rows of items, a list that wraps onto a lower-case line, a level on its own
   line before or after its language, and a row of languages ("Español (Nativo) · Inglés (C1)").
6. **The place** is also looked for beside the e-mail and phone, for contact blocks in a sidebar.
7. **Letter-spaced text** (Monograph's name and headline, the headings of the tracked templates).
   pdf.js returns "I ng e ni e r a de da t os" with spaces wherever two glyphs are far apart, so
   the word boundary is lost before the heuristics see it. Two repairs:
   - The glyphs the page draws are read from its operators (`getOperatorList`), where a space is
     a space glyph. A letter-spaced item takes its text from there (`repairSpaces`); the other items
     keep pdf.js's text, since a gap drawn as a margin (the " · " between items) has no glyph. An
     item is letter-spaced when it is made of pieces of a letter or two, or has a lone consonant
     ("d atos"). A gap next to one is read with a threshold of 0.3 em instead of 0.1, because every
     letter is that far from the next. The lookahead for an item that is not where the last one
     ended is bounded.
   - The PDF's title ("Łucja Øster-Ñúñez – CV", set by the app's two exports), or one part of it
     that a dash or bar sets apart ("CV – Ada Lovelace – 2024"), is adopted as the name when it has
     the same letters, with control and bidirectional characters removed. That keeps the case and
     the "de" of a name set in capitals. A PDF without such a title takes the name from the page,
     now repaired as above.
8. **Headings in ordinary case** ("Charlas" in Frame, Banner, Chevron, "Hobbies" in the real CV).
   When the known headings are not in capitals, a short line without digits or punctuation, in the
   same size within 2 % (an entry's title is about 3 % smaller), the same weight, in the same
   column and set apart by a gap at least 0.9 times the headings' own is a heading too. Size alone
   tells it from the text only when the headings are visibly larger; otherwise it takes headings
   that are bold while little of the text is. A line followed by its dates is an entry's title.
9. **Real bold.** pdf.js gives an internal font id, not the font's name, so `bold` was never set.
   After `getOperatorList` the page's fonts are resolved: a font named "…-Bold", "…-SemiBold",
   "…-Black" is bold. This is what item 8 uses.
10. **The headline** is the line under the name in the name's own column (by position, not by order),
    so contact details set beside the name no longer take its place, and it no longer depends on the
    name's text, which the title may have changed.
## Not in scope

- Bold detection: pdf.js gives an internal font id, not the font's name, so `bold` is never set.
- A scanned PDF (no text layer) is still refused.

## Acceptance criteria

1. [x] The score goes from **24 of 104** to **104 of 104**, and the name comes back in all 26: every template, direct PDF and print,
   recovers its experiences, education entries, skill items and languages in number.
2. [x] `qa:roundtrip` checks that (104 new checks), so a regression shows up there.
3. [x] A real CV from another tool, with a different layout, does not get worse (see below).

## Verification

- 569 unit tests (2 skipped: local scratch), plus the typecheck. New: `tests/pdfLayout.test.ts` (cells, reading order, gutters,
  tables, bands, side-by-side headings) and cases in `tests/pdfImport.test.ts` for each rule above.
  Every rule was mutated and its test fails without it (two mutants survived the first round, the
  top band and the style match, and got their tests).
- `qa:roundtrip` 364/364 (232 before, plus the 104 import checks, the 26 names, no longer with an
  exception, and the 26 headlines), `qa:e2e` 93/93, `qa:security` 53/53.
- Every rule of items 7–10 was mutated and its test fails without it (five mutants survived the
  first round and got stronger tests).
- A real, three-page CV from another tool (Word-like, dates and headings in a left column, skills
  in capitals) was run before and after, looking at structure only: 4 dated experiences before and
  after (now with 12 highlights instead of 0), 30 skill items before and after, 10 languages (9
  before). It showed two mistakes of the first version, now fixed: capitals read as headings, and a
  table of labels read as two columns.
- The same real CV after items 7–8: a "Hobbies" heading is found and the languages list goes from
  10 to 3 (it had swallowed the hobbies).
- Two PDFs the app produced earlier (a different template): experiences 2 (1 dated before, 2 now),
  education 1 (0 before), languages 3 (24 before), skills 12 (9 before).

## Not changed

- A PDF whose producer leaves its spaces out and positions the words instead keeps pdf.js's text,
  as the repair only touches letter-spaced items.
- A heading in ordinary case that is neither larger nor bold nor in capitals, or that has no dates
  guard to rely on (an entry's title with its dates two lines below), cannot be told from the text.
- A page whose operators cannot be read is used as pdf.js gives it, with no repair and the font ids
  as the only bold signal.
