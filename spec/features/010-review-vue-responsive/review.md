# 010 · Review: Vue / frontend practices and responsive consistency

**Status:** done (fixes below); open items listed at the end.

Scope: everything since review 007 (features 008–009) plus a viewport sweep of the whole editor.
Method: static audit (SFC size, keys, `v-html`, `any`, breakpoints, spacing values), an independent
read-only subagent review, and measurement in a real browser at 320, 390, 768, 820, 1024, 1180 and
1440px across seven views (personal, experience, skills, style, export, documents, import):
horizontal overflow, elements outside the viewport and target sizes. Touch was emulated with
`hasTouch`/`isMobile`; no physical device or Safari was used.

## Fixed

| Severity | Finding (measured) | Commit |
|---|---|---|
| Required | My hidden file input was stretched to the viewport by `BaseField`'s `input { width: 100% }`, adding horizontal scroll on the personal step (+96px at 390, +529px at 768, +445px at 1440) | `84ac062` |
| Required | At 320px the wizard footer cut "Siguiente" off (three nowrap buttons) | `70341a2` |
| Required | At 320px the "Imprimir / Guardar como PDF" button left its card | `eb4ef06` |
| Required | At 320px skill names were squeezed to ~3 letters beside a 7.5em select | `d18447c` |
| Required | Header buttons/tabs 27-30px, step pills 29px, swatches 33px, form controls 39px on touch | `7959c01` |
| Required | Palette swatches announced by hex code to screen readers | `cf27647` |
| Optional | `StepStyle` 292 lines mixing gallery and controls; `StepPersonal` held photo URL bookkeeping | `9f09feb`, `ae6ca24` |
| Nit | Indentation left over after removing the `.columns` wrapper (whitespace only) | `68addc9` |

After the fixes the sweep reports no horizontal overflow at any of the 7 widths in any of the 7
views, and nothing under 40px on a coarse pointer (phone and iPad). The mouse desktop is unchanged.

## Subagent findings not adopted

- "Long emails could overflow the A4 page in banner, frame, ledger" — **not reproduced**: with a
  100-character unbroken email none of the 13 templates overflowed (script measured scrollWidth and
  every child's right edge).
- "Add an id to `SkillItem` for stable keys" — the rows are controlled inputs, so index keys render
  correctly; an id would be a schema change. Left as is.
- "`hint="JSON"`/`"PDF"` are hard-coded" — they are format names, not prose.
- FileDropzone accessible name includes the hint: accepted, since a visible label that wraps its
  text is the native pattern; the alternative needs an extra labelling structure for little gain.

The subagent did not render anything, so it missed all the layout failures above; only the
measurements found them.

## Left open

- **Spacing has no scale.** App components use `em` values 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.5,
  0.55, 0.6, 0.7, 0.8, 0.9, 1, 1.2, 1.4, 1.6. Proposal: tokens `--space-1..6` in `app.css` and a
  one-pass replacement per component (large diff; do component by component).
- **Three breakpoints** (1000px App/CvWizard, 900px AppHeader, 640px forms/NoticeBar) plus the new
  480px phone rules. Proposal: two (640, 1000) and phone rules at 480, documented in the tech stack.
- **Template markup is duplicated** (experience, education, custom entries and skill blocks, ~300
  lines in each of six templates). A shared `data`-only sub-component would still satisfy the
  one-prop contract; it conflicts with "each template owns its visual language", so it needs a decision.
- Safari: `dragleave` reports a null `relatedTarget`, so the drag highlight may flicker there;
  not tested. `:has()` has a `:focus-within` fallback.
- Not run on real devices.
