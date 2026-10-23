# 001 · Plan

## Approach

1. **Pure helpers in `src/templates/shared.ts`** (no model change, no migration):
   - `languageLevelScore(level: string): number | null` — normalises (lowercase,
     no accents), looks up an exact label table (es + en), then falls back to a CEFR
     token (`A1`–`C2`) inside the string. Anything else is `null`. Independent of
     the UI locale.
   - `levelAccessibleLabel(score, language)` — "Nivel 4 de 5" / "Level 4 of 5" from a
     small es/en table keyed by the CV content language, like `MONTHS`.
2. **Shared component `src/templates/LevelDots.vue`** (a file, not a folder, so the
   registry glob `./*/index.ts` and the per-folder contract test ignore it). Props:
   `score`, `label`. Five dots, `role="img"` + `aria-label`; colour from
   `--cv-accent` (overridable with `--dots-color`).
3. **Timeline and header block stay inside each template** (tech-stack: each
   template owns its visual language; no shared theme). Plain CSS using tokens.
4. **Templates**: `src/templates/meridian/` and `src/templates/banner/`, each
   `index.ts` + `Template.vue` + `thumbnail.ts`, self-registering. Unique default
   accent each (the defaults test requires distinct accents).
5. **i18n**: `templates.meridian.description` and `templates.banner.description` in
   `es.ts` and `en.ts`. Existing tags are reused; no new UI strings.

## Decisions

- Level indicator only for languages (skills have no level in the model).
- Dots, not stars/bars: simplest to render identically in preview and print.
- Unknown level text → no indicator, text still printed.
- `meridian` follows `modern`'s sidebar approach (grid + `print-color-adjust`).

## Risks

- Full-height sidebar on pages 2+ under paged.js: verify in the live preview/export.
- Contract test limits hardcoded colours in `Template.vue` styles: use tokens or the
  allowed neutral inks only.
