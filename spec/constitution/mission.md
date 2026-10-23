# Mission

## What we're building

CV Maker is a fully browser-based CV/résumé editor built for privacy and speed: nothing gets uploaded to a server.

1. **Guided authoring** : a step-by-step wizard (personal info, summary, experience, education, skills, languages, custom sections) backed by a single typed `CVData` model.
2. **Live preview** : a paginated, print-accurate preview that updates as you type, using the same template that will be exported.
3. **Templates** : multiple interchangeable visual templates (classic, modern, compact, aurora, editorial, monograph…), auto-registered and swappable without losing data.
4. **Import** : bring in an existing CV from a PDF (extraction + heuristics + manual review) or from a previously exported JSON file.
5. **Export** : to PDF, print-ready HTML, or JSON, instantly, client-side.
6. **Persistence** : autosave to IndexedDB, undo/redo history, multi-document management — all local to the browser.

## Who it's for

- People who want to build or update a CV without installing software, creating an account, or sending their data anywhere.
- Privacy-conscious users who don't want personal/career data passing through a third-party server.
- Users who want to try several visual templates on the same content before exporting.

## Principles

- **Privacy by design** : all processing happens client-side; no CV data is ever uploaded to a server.
- **No friction** : no sign-up, no install; open the page and start writing.
- **Local-first durability** : autosave + undo/redo so work is never silently lost.
- **Template portability** : the `CVData` contract is template-agnostic; any template can render any valid document.
- **Print fidelity** : what's shown in the live preview must match the exported PDF/HTML.

## What it is NOT

- Not a cloud CV builder : no accounts, no server-side storage, no sharing links (out of scope for v1 — see `spec-cv-editor-en.md` phases 5–6).
- Not a general-purpose document editor : it only models and renders the CV domain (`src/types/cv.ts`).
- Not a design tool : templates are predefined and data-driven, not freely art-directed per document.
