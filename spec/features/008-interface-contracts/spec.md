# 008 · Interface contracts: skill-level capability and i18n key guard

**Status:** proposed

## What it does

1. **`skillLevels` capability.** `TemplateCapability` gains `skillLevels`. The seven
   templates that draw a skill's level declare it (`meridian`, `banner`, `ledger`, `harbor`,
   `frame`, `chevron`, `facet`); the other six do not. In the skills step, on a template
   without it, the level selectors are disabled and the standard explanation is shown
   ("This template does not show skill levels. The data is kept."). Levels already set are
   never deleted.
2. **Guard for built i18n keys.** A test fails if any font option lacks its description in
   `es` or `en`.

## Why

The project's own contract (uneven capabilities, spec §4) says: data a template ignores is
kept, and the related control is dimmed with a reason. Skill levels were the one data kind
that broke it: the user could rate skills on a template that never prints the rating. Keys
built with string interpolation escape type checking and `t()` falls back to printing the key.

## Acceptance criteria

- [ ] `TemplateCapability` includes `skillLevels` (additive; no existing value changes).
- [ ] A test proves the declaration is truthful for every registered template: a rated skill
      produces a level mark if and only if the template declares `skillLevels`.
- [ ] On a template without it, the level selector is disabled and the reason is visible;
      switching back to a supporting template restores it, with the data intact.
- [ ] The explanation is in `es` and `en` through the existing `style.capability` table.
- [ ] A test asserts every `FONT_OPTIONS` id has a non-empty `style.fonts.<id>` in both languages.
- [ ] No change to `src/types/cv.ts` (no migration); `npm test`, typecheck and build pass.

## Out of scope

- Typing `t()` keys across the whole app.
- Documenting the CSS variables templates receive as a typed list (noted as optional in 007).
