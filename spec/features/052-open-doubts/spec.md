# 052 · The open doubts, one at a time

**Status:** in progress

After spec 051 the doubts left were listed and the user asked for all of them to be tackled, one
commit each. This spec records each one: what was found, what was done, and what could not be.

## 1 · A long sidebar pushed the career onto a later page (Cobalt, Monogram)

Checked with the real direct-PDF pipeline and 10 / 25 / 45 / 80 skills in one unnamed group. No text
was ever lost (every skill and the career are in the PDF), but the layout broke: at 45 skills
Cobalt's skills section did not fit page 1, so the whole sidebar section moved to page 2 and the
career started on page 3, with page 1 nearly empty. Aurora, whose skills are one line, never did.

Fix: an unnamed group of more than 10 skills is set as one line ("a · b · c") instead of a bullet
each, as a named group already was. With 45 skills Cobalt goes from 4 pages to 2, with the career on
page 1; Monogram from 3 to 2. At 80 skills the career still starts on page 2 (Cobalt) — an
extreme case, and the export dialog's side-column warning (spec 033) covers it. Skills with
levels (one row each) are not changed.

Verification: a unit test per template (8 skills: bullets; 11: one line), mutation-checked.

## 2 · The page and the PDF could use different fonts on a computer without Georgia, Arial or Times

The PDF draws Georgia in Gelasio, but the page showed whatever the computer fell back to (on Linux,
DejaVu Serif), so the two could differ. The CV's `--cv-font` now carries each stand-in right after the
system font it stands for (`Georgia, 'Gelasio', 'Times New Roman', 'Tinos', serif`;
`core/fontStandIns.ts`, `fontStackWithStandIns`, applied in `styleVars`). A computer that has
Georgia still shows Georgia; one that has not shows Gelasio, as the PDF does. Stored documents are
not touched (the stored value is still the one the select matches). The standalone HTML export
embeds the stand-in's faces too, so the file looks the same when opened elsewhere (it grows by about
0.7 MB for these fonts, as any CV font does).

Verification: a unit test of the stack builder; the `fidelity` e2e block checks every template's
page stack; on this machine (no Georgia) the preview computes `Georgia, Gelasio, "Times New Roman",
Tinos, serif` and loads Gelasio.
