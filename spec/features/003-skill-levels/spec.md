# 003 · Skill levels and level indicator variants

**Status:** implemented ✅

## What it does

1. Each skill can carry an optional level from 1 to 5.
2. Templates that show levels (`meridian`, `banner`) draw it as dots next to the
   skill; the level indicator gains stars, bars and dashes variants so different
   templates can look different.
3. The skills form lets the user set each skill's level (or none).

## Why

Level indicators are the most repeated visual in the templates this project takes
inspiration from, and today only languages can show one. Skills are plain strings,
so a per-skill level needs a model change; it is done once, with a migration.

## Acceptance criteria

### Model and migration

- [x] `SkillGroup.items` becomes `SkillItem[]` where `SkillItem = { name: string; level?: number }`
      (`level` is an integer 1–5 when present).
- [x] `SCHEMA_VERSION` goes 1 → 2 with a migration step that turns every string item
      into `{ name }`. No skill text is lost or reordered.
- [x] Importing a v1 JSON file, loading a v1 document from storage and migrating a
      v2 file all produce a valid v2 `CVData` (`migrations.test.ts`).
- [x] `normalize` drops an out-of-range or non-integer `level` instead of keeping it,
      and keeps the item.
- [x] A file newer than v2 is still rejected.
- [x] PDF import still produces skill groups (as items without level).

### Form

- [x] Each skill shows its name and a level selector (none, 1–5); items can be added
      (Enter or comma), renamed and removed.
- [x] Undo/redo and autosave treat these edits like any other.
- [x] Strings in `es.ts` and `en.ts`.

### Templates

- [x] All eight existing templates keep printing skill names exactly as before.
- [x] `meridian` and `banner` show the level of a skill that has one, with the
      accessible label from `levelAccessibleLabel`; a skill without level shows no
      indicator.
- [x] The level indicator supports `dots`, `stars`, `bars` and `dashes`; the filled
      amount is not conveyed by colour alone.

### Quality

- [x] `npm test`, `npm run typecheck` and `npm run build` pass.

## Out of scope

- Levels for experience, education or custom sections.
- New templates (feature 004) and decorative shapes (feature 005).
