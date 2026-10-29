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
3. [x] Re-importing a downloaded PDF keeps the name and e-mail whole, in all 13 templates.
4. [x] `slugify('Łucja Øster-Ñúñez')` is `lucja-oster-nunez`.

## Not covered

- **Monograph's letter-spaced name.** pdf.js already returns it as single letters with one space
  between each, so the word boundary is lost before this code sees it. It still imports as
  "Łucjaøster - Ñúñez".
- **How well PDF import rebuilds sections.** It varies a lot by template, for example Banner finds
  42 skills out of 12. The app already presents it as "a help, not an automatic conversion".

## Verification

- 505 unit tests, plus the typecheck. New tests cover the inline photo in the store (four cases),
  `joinFragments` and `slugify`.
- The round trip in the browser passes 179 of 182 checks (171 before). The 3 that fail come from the
  check itself: Aurora and Monograph set their text in capitals with CSS.
- `qa:pdf` 111/111, `qa:e2e` 81/81, `qa:security` 53/53.
