# 014 · Plan

## Approach

Flat string fields on `PersonalDetails` (like `phone`), a v2 → v3 migration, one shared
`contactItems(data)` helper that every template calls, and a collapsed block in `StepPersonal`.

## Implementation

1. `types/cv.ts` (`SCHEMA_VERSION = 3`, five fields, `MaritalStatus`), `core/factory.ts`, `core/migrations.ts` (step 2) + tests.
2. `templates/shared.ts`: labels per language, `formatBirthDate`, `contactItems(data)`; the 13 templates use it; tests.
3. `StepPersonal.vue`: collapsed `<details>` block, i18n es/en, tests.
4. Sweep and close.

## Decisions

- **Flat fields, `''` when empty**: same shape as the existing contact fields; no `undefined` handling.
- **Marital status stored as a code** (`single`, `married`, `partner`, `divorced`, `widowed`), localized when rendered, so changing the CV language relabels it.
- **No visibility flags**: empty means hidden; a flag would be a second source of truth.
- **`<details>`** for the block: native, keyboard and screen-reader friendly, no script.

## Risks

- **Thirteen templates touched**: each change is one line (the inline array becomes a helper call); the render tests cover all of them.
- **Long values in narrow sidebars**: items already wrap (`overflow-wrap`); checked in the sweep.
