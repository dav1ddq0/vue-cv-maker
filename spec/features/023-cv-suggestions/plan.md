# 023 · Plan

1. Spec, plan, tasks.
2. `src/core/suggestions.ts`: the rules as data (id, level, step, check), `suggest`, `cvScore`. Tests.
3. UI: `ReviewCard.vue` in `components/form/`, used by `StepExport`; i18n (es/en); the export step
   detail in `useStepDetail`. Tests.
4. Screenshots, roadmap, close.

## Decisions

- **Pure function in `core/`**, like `stepStatus`: derived on every render, never stored, so there is
  nothing to migrate and nothing to get stale.
- **In the Export step**: it is where the user decides the CV is done. The rail count makes it
  discoverable from any step without nagging inside each form.
- **Score from rules, not sections**: "8 of 8 steps" already exists; the score answers a different
  question (how much of what recruiters expect is there). Important rules count twice.
- **Figures as an impact proxy**: "Cut load time from 4.2 s to 1.1 s" is the advice every CV guide
  gives; a digit anywhere in the experience text is a cheap, language-neutral signal. It is a tip, not
  a verdict.
- **Caps**: per-entry rules stop at 3 so a long CV is not buried in near-identical items.
