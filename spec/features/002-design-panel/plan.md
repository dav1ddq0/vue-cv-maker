# 002 · Plan

All changes live in `src/components/form/StepStyle.vue` plus data and i18n.

1. **Palette** — constant `PALETTE` in the component (or `src/core/stylePresets.ts`
   if tests need to import it); a row of `<button aria-pressed>` swatches above the
   colour input; writes `style.accentColor`.
2. **Fonts** — `FONT_OPTIONS` in `src/core/stylePresets.ts`: `{ id, value, descriptionKey }`.
   Includes the stacks that templates use as defaults. Select shows the label, with the
   description as the option's hint text.
3. **CV language** — `<select v-model="cv.data.meta.language">` with `es`/`en`.
   Labels come from i18n and are written in their own language ("Español", "English")
   so they stay readable when the UI language differs.
4. i18n keys under `style.*`; tests in `tests/stylePresets.test.ts`.

One commit per numbered item, each recorded in `tasks.md`.
