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
