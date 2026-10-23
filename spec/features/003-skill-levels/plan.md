# 003 · Plan

1. **Model + migration (one atomic commit)**: `SkillItem`, schema v2, step 1→2,
   `normalize` handling, `skillNames()` helper in `templates/shared.ts`, and every
   consumer (factory, sample, PDF import assemble, all templates' `join`) updated so
   the build stays green. Tests: migration v1→v2, level clamping, PDF import.
2. **Skills form**: new `SkillItemsEditor.vue` (name + level select + remove + add
   input) replacing `TagInput` in `StepSkills.vue`; i18n.
3. **Show skill levels**: `meridian` and `banner` render `LevelDots` per skill with a level.
4. **Indicator variants**: `LevelDots` gets `variant` (`dots|stars|bars|dashes`); each
   of the two templates picks one; tests per variant.

One commit per step, recorded in `tasks.md`.
