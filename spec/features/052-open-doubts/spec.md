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

## 3 · The soft shadow was banded

Spec 051 drew a blurred shadow as 24 nested translucent shapes; zoomed in the steps showed. It is now
a PNG with alpha blurred by the canvas itself (σ = blur / 2, as CSS), embedded under the box with
its offset and spread: smooth, and the same falloff as Chrome's. Where the canvas cannot blur
(`ctx.filter` missing, as in older Safari) the layered shadow of spec 051 is the fallback. The look
fixture now ink within 4 % of the print (1.4 % measured; it was 3.5 % with layers), and its limit
went from 8 % to 4 %.

## 4 · The CSS scan only saw the sample CV

The `fidelity` block of `qa:e2e` scans the computed CSS of the sample CV, so a style used only in a
rarely shown state (a custom section, a long list, a page break) could slip through. A static guard,
`tests/templatePdfSafe.test.ts`, now reads the CSS of every template and the pieces they share
(`LevelDots`, `Breakable`) and rejects what the direct PDF cannot paint: gradients, background
images, filters, text shadows, underlines, outlines, blend modes, inset shadows and corners of
different radii. Each rule was mutation-tested with a bad line in a template.

## 5 · The "depends on each computer" note of the export dialog could no longer appear

Every font of the style select now has a bundled stand-in (specs 050, 051), so the note under "PDF"
in the export dialog, the sheet and the export step, and the `systemFont` value behind it in
`useCvExport`, could never show. Removed, with the `exportView.systemFontNote` strings (en, es) and
the export-dialog test that asserted the old note. Kept: the "depends on the computer" label of
the font select itself, which is still true of the page (not of the PDF).

## 6 · The nine colours of the reference

The reference had a row of nine swatches. Adding them to the shared palette would have changed every
template, so a template can now declare its own: `TemplateDefinition.palette` (optional,
`types/template.ts`). The style step shows `palette ?? PALETTE` for the template in use
(`StepStyle.vue`). Monogram declares nine — graphite, slate, navy, cobalt (its default), teal,
emerald, amber, sand and red — each named in both languages (`style.colorNames`), and the custom
colour picker stays next to them. The palette tests now cover every colour a template declares
(contrast for its ink and as text on paper, and a name in each language); a test mounts the step
with Classic (five swatches) and Monogram (nine, in order), mutation-checked.

## 7 · Browsers without View Transitions, and other engines

Only Chromium is installed for Playwright, so Firefox and Safari could not be run. What was done:

- The `transitions` block of `qa:e2e` has a run with `document.startViewTransition` removed before
  the app loads (what Firefox and Safari before 18 give): Preview opens, Edit comes back, the next
  step shows, with no console error. Mutation-checked (without the API guard it fails with
  `startViewTransition is not a function`).
- `qa/e2e/lib.cjs` takes `QA_BROWSER=firefox` or `QA_BROWSER=webkit` to run the whole suite on that
  engine once it is installed (`npx playwright install firefox webkit`, a download that has to be run by
  the user). Not run on them yet.

## 8 · The "overflow" in the Template step

The report never said what overflowed, so the step was swept at 15 widths (320 to 1920 px), light and
dark, for the candidates offered earlier. Two were real, one was not:

- **The preview scrolled sideways at 1024 px** (a laptop at that width): the narrowest preview panel
  is about 300 px and the page could not be zoomed below 40 % (317 px), so the paper stuck out by
  3 px (the panel scrolled 19 px). `ZOOM_MIN` is now 30 %, so fitting needs no sideways scroll.
- **The template cards of one row had different heights** (up to about 100 px, from the length of the
  description and the tags), on the grid and in the phone's carousel. The cards now stretch to the
  tallest of their row (`.templates > li { display: flex }`, `.card { height: 100% }`).
- **The last card under the sticky footer** did not happen: at the end of the scroll it always clears
  the footer.

The consistency suite has a new 1024 × 768 profile and a check that the cards of a row are one
height (11 checks over 316 views); both were mutation-checked by reverting each fix. A unit test
pins the gallery CSS, and the zoom test now expects 30 %.

## 9 · Firefox (and a bug it found)

Firefox 1543 (Playwright's build) installed with `playwright install firefox`; the whole e2e suite
now runs on it with `QA_BROWSER=firefox npm run qa:e2e`.

**A real bug.** On Firefox the app opened an empty editor and not the person's stored CVs (or the
welcome screen). `navigator.storage.persist()` answers only when the person answers Firefox's
permission prompt, and `probeEnvironment` awaited it before `cv.init()` opened the CVs, so until
then (and for ever in a headless run) nothing was loaded. Now only the storage probe is awaited;
persistence is recorded when it answers (a refusal still shows the notice). A unit test, with a
persistence request that never answers, fails without the fix.

**The suite on other engines:** the performance block (prints with `page.pdf`, Chromium only) and
the rename block (reads an SVG page's storage) are skipped there; blocks run one at a time (eleven
at once made Firefox miss animation frames); Playwright's own driver warnings (`juggler`) are not
counted as console errors; the CSS scan ignores the `::before` Firefox reports for an `<img>`.
Result: 98/98 on Firefox, 123/123 on Chromium. View Transitions run on this Firefox too (the Edit /
Preview and full-width switches start one each).

**WebKit** is downloaded but cannot start: the machine lacks `libevent-2.1-7t64`, `libavif16` and
`libmanette-0.2-0`, which need `sudo apt-get install` — to be done by the person who owns the
machine. `QA_BROWSER=webkit npm run qa:e2e` then runs the same suite.
