# 012 · Plan

## Approach

Presets are plain data in `src/core/sectionPresets.ts`; `createSectionFromPreset(id, language)`
returns a normal `CustomSection`. The picker in `StepCustom.vue` calls it. Nothing in the model or
templates changes.

## Decisions

- **No preset id stored on the section**: it would need a schema change and nothing reads it yet.
- **Titles per CV language, labels per UI language**: the section title is CV content; the button is UI.
- **Seed entries only where the section is useless empty** (references, clause).
