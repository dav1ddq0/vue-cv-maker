# 021 · Per-CV template

**Status:** implemented ✅

## What it does

Each CV remembers its own template. Opening a CV shows it in the template it was made with;
picking a template changes only the open CV. My CVs shows each CV's template and accent colour.

## Why

- The template is a global preference (`prefs.lastTemplateId`, `ui.templateId`). Someone with a
  "corporate" CV and a "creative" one sees both in whichever template they picked last, and an
  export of the other CV silently comes out in the wrong design.
- A JSON export does not carry its template, so importing it on another machine loses the design.
- The My CVs list cannot tell CVs apart visually (spec 018 left monograms as the honest option).

## Acceptance criteria

- [x] `CVMeta.templateId` is part of the model; `SCHEMA_VERSION` 4 with a v3 → v4 step.
- [x] A stored or imported v3 CV gets the template the user had last picked (what it looked like
      before); a missing or non-string value falls back the same way. Unknown ids are kept as is and
      render with the default template (the registry already falls back), so a file from a newer
      version with more templates does not lose its choice.
- [x] Picking a template in the Style step changes `cv.data.meta.templateId`: it autosaves, is
      undoable, and the preview, PDF, HTML and paginated preview all use it.
- [x] Opening another CV switches the preview to that CV's template.
- [x] A new blank CV starts with the last template picked; the sample CV too. A duplicate keeps the
      source's template.
- [x] The JSON export includes the template and the import restores it.
- [x] My CVs (desktop tiles and phone cards) shows the template name and an accent swatch for each CV;
      entries saved before this feature show neither until the CV is saved again.

## Out of scope

- Rendered thumbnails of each CV (needs rendering every CV or caching images).
- Per-CV theme, UI language or other preferences.

## Verification

- 388 unit tests (new: v3 → v4 with and without fallback, invalid and unknown ids, factory default;
  store: the pick autosaves and undoes, opening a CV switches template, a new CV takes the last pick,
  a duplicate keeps its source's; My CVs tag with and without template).
- Dev server (Playwright, 1440×900): sample CV → Meridian; a new CV starts in Meridian and is set to
  Aurora; My CVs shows "Plantilla Aurora" and "Plantilla Meridian" with their swatches; reopening the
  sample and reloading keep Meridian. A v3 CV written straight into IndexedDB with the last pick set
  to Harbor opens in Harbor and shows no tag until saved. No console errors.
- PDF export with each template was not re-run by hand; it takes the same `templateId` as the preview.
