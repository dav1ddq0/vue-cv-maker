# 012 · Section library

**Status:** implemented ✅

## What it does

"Add section" offers ready-made sections (courses, certificates, internships, projects, hobbies,
references, data-protection clause) besides the blank one. Each is created with a title in the
CV's content language and, where it helps, a pre-filled entry ("Available on request", the consent
sentence).

## Why

The gap analysis (011) found that most sections users expect from other builders already work as
custom sections, but nobody discovers them: they start from an empty title. Presets close that
gap with no schema change.

## Acceptance criteria

- [x] A picker lists the presets plus a blank section; every button is a real `<button>`.
- [x] A preset section is titled in `meta.language` (es/en), independent of the UI language.
- [x] References starts with an "available on request" entry; the clause starts with the consent sentence.
- [x] The new section is appended to `sectionOrder` and is undoable like any edit.
- [x] No schema change, so no migration.
- [x] Every preset has titles for each CV language and a label in each UI language (tested).

## Out of scope

- Extracurricular activities (P2), new section kinds (list/description) and per-section page break (P2).
- Optional personal data (date of birth, nationality, licence): separate feature with schema v3.
- A plain-text export: rejected, the JSON export already covers data portability.
