# 021 · Plan

1. Spec, plan, tasks.
2. Model: `CVMeta.templateId`, `SCHEMA_VERSION = 4`, v3 → v4 step, `normalize` fills the value from a
   caller-given fallback; `DEFAULT_TEMPLATE_ID` moves to `core/factory.ts` (the registry re-exports it).
   The IndexedDB adapter and the JSON import pass `prefs.lastTemplateId` as the fallback. Tests.
3. Wiring: the template is read from `cv.data.meta.templateId` everywhere (`ui.templateId` and
   `ui.setTemplate` go away — the state moves, it is not duplicated). Picking writes the CV and
   remembers the pick in prefs for new CVs. `createNew` seeds from the pref. Tests.
4. My CVs: `CVSummary` gains optional `templateId` and `accentColor`; tiles and cards show the template
   name and a swatch. Tests.
5. Manual check, roadmap, close.

## Decisions

- **In `meta`, not `style`**: `style` holds tokens that reach CSS; the template is which component
  renders, alongside `language`, which also describes the document rather than its look.
- **Fallback from prefs, not `'classic'`**: every existing CV was shown in the last picked template, so
  that is the value that keeps it looking the same after the upgrade. `core/` stays free of storage:
  the fallback is a `migrate` option.
- **No registry check in `normalize`**: `core/` does not import templates, and `getTemplate` already
  falls back. The id is only used as a lookup key, never written into HTML or CSS.
- **Optional summary fields**: the index is a cache rebuilt on each save, not migrated; old entries
  simply lack the swatch until their CV is saved.
