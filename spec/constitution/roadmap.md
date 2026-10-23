# Roadmap

_Order and status of features. Each entry points to its folder under `features/`._

## Done ✅

_Completed before this SDD process was adopted; listed here for context, not tracked as `features/XXX-...` folders. See `spec-cv-editor-en.md` for the original phased spec._

1. **Phase 1 — Core**: `CVData` model, store with persistence, full wizard, `classic` template, live preview, PDF export, JSON import/export.
2. **Phase 2 — Templates**: auto-discovery registry, `modern` and `compact` templates, style tokens, uneven capabilities, HTML export, paged.js.
3. **Phase 3 — PDF import**: pdf.js extraction, heuristics, review screen with manual assignment.
4. **Phase 4 — Polish**: multi-CV management, section reordering, custom sections, mobile layout, undo/redo.

## Done with SDD ✅

- **001** · Visual template elements: level indicator, `meridian`, `banner` (task 8 still open: photo, multi-page and PDF/HTML export not yet checked visually)
- **002** · Design panel: five-colour palette, curated font list, CV language selector
- **003** · Skill levels: schema v2 (`{ name, level? }`), skills form, level indicator variants
- **004** · Template families: `ledger`, `harbor`, `frame`
- **005** · Readable ink on accent backgrounds, `chevron`, `facet`

## Next 🔜

<!-- Add the next feature as `XXX · <Name>` once its features/XXX-.../spec.md exists. -->

- Candidate: accent-for-text token so light accents stay readable on white (see 005 tasks).
- Candidate: template carousel with rendered thumbnails and preview controls (zoom, pages, full screen).
- Candidate: web fonts via a bundled font package (needs a dependency decision).
- Candidate: close 001 task 8 (photo, multi-page, PDF/HTML export).

## Backlog / ideas 💡

- **Phase 5–6 — Backend**: stateless FastAPI service, then sync. Out of scope for v1; the app must stay fully usable with the backend permanently absent.

> Every new feature is created as `features/XXX-feature-name/` with `spec.md`, `plan.md`, and `tasks.md` before any code is touched.
