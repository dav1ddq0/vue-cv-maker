# 037 · Upload → download → upload fixes

**Status:** implemented ✅

## What it does

Found by a round-trip run in the browser. For each of the 13 templates, a hard JSON file is uploaded
("Łucja Øster-Ñúñez", Dvořák, Straße, curly quotes, a link) with a cropped photo. The CV is then
downloaded as direct PDF, print, HTML and JSON, and each download is uploaded again. The downloads
were right; uploading them again showed three defects.

1. **A photo imported from JSON was not shown.** This dates from the first commit.
   - The exported file carries the photo as a data URL, and import kept it that way in the CV.
   - The preview and the step-1 thumbnail only resolve `photo:{id}` references, so they showed
     nothing. The downloads still included the photo.
   - The store now saves an inline photo as a blob, like an uploaded one, and keeps only its
     reference. This happens on import (new CV or over the open one) and when a CV stored that way
     is opened. As a result, megabytes of base64 no longer go into every undo snapshot.
   - If there is no space left, the import says so, using the existing quota notice. A stored CV
     whose photo cannot be moved still opens as it was.
2. **PDF import put spaces inside words.**
   - Fragments on one line were joined with a space whatever their position. A PDF draws one word
     in several touching pieces when part of it comes from another font file ("Ł", "ř") or when it
     was laid out with break points (e-mails and URLs since 033).
   - This gave "Ł ucja", "Dvo ř ák", and lost the e-mail on every direct-PDF import.
   - Fragments are now sorted by x and get a space only for a gap wider than 0.1 em. Touching
     pieces measured within ±0.03 em on the app's own PDFs; word spaces measured 0.17 em or more.
3. **JSON and HTML downloads lost letters from the file name.**
   - `slugify` dropped Latin letters that do not decompose, so "Łucja Øster-Ñúñez" became
     `ucja-ster-nunez`.
   - ł ø ß æ œ đ ð þ ħ ı are now transliterated first. A name in another script still falls back
     to `cv`.

## Acceptance criteria

1. [x] After a JSON import, the photo shows in the preview and the thumbnail, and is stored as a blob.
2. [x] A CV stored with an inline photo has it moved to a blob when opened.
3. [x] Re-importing a downloaded PDF keeps the e-mail whole in all 13 templates, and the name in 12
   (Monograph's letter-spaced name is the exception, see "Not covered").
4. [x] `slugify('Łucja Øster-Ñúñez')` is `lucja-oster-nunez`.
5. [x] The round trip is a QA script, `npm run qa:roundtrip` (also part of `npm run qa`). It exits
   non-zero on any failed check.

## `qa:roundtrip`

- **What it runs:** `qa/roundtrip.cjs`, on the built site, with files written to `.qa/roundtrip/`.
- **Templates:** every one with a folder under `src/templates/` and a `Template.vue` in it.
- **Checks:**
  - file names;
  - the downloaded JSON against the uploaded one;
  - name, e-mail and accents as text in the direct PDF;
  - pages in the direct PDF against the print;
  - the photo, embedded only where the template shows it;
  - the HTML opened from disk;
  - the JSON uploaded again: exact, with the photo showing;
  - both PDFs through PDF import: name and e-mail recovered. Monograph's name is excepted, see
    "Not covered".
- **Comparing text:**
  - Text is compared without case, because templates set capitals with CSS.
  - PDF text is also compared without spaces, because pdftotext spaces out letter-spaced text.
- **Report only, not checked:** the entries PDF import rebuilds per section.
- **Detects the photo bug:** with the store from before this fix, the 8 photo templates fail.

## Not covered

- **Monograph's letter-spaced name.** pdf.js already returns it as single letters with one space
  between each, so the word boundary is lost before this code sees it. It still imports as
  "Łucjaøster - Ñúñez".
- **How well PDF import rebuilds sections.** It varies a lot by template, for example Banner finds
  42 skills out of 12. The app already presents it as "a help, not an automatic conversion".

## Verification

- 505 unit tests, plus the typecheck. New tests cover the inline photo in the store (four cases),
  `joinFragments` and `slugify`.
- The round trip in the browser passes 179 of 182 checks (171 before). The 3 that failed came from
  the check itself (capitals set with CSS) and are fixed in the `qa:roundtrip` version.
- `qa:roundtrip` 232/232, `qa:pdf` 111/111, `qa:e2e` 81/81, `qa:security` 53/53.
