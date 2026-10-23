# 007 · Code review of features 001–006

**Status:** implemented ✅ (review done; optional items left open on purpose)

Review of everything since the baseline commit `82c5d06`, on the five axes (correctness,
readability, architecture, security, performance), with checks run rather than assumed.

## Findings and what was done

| # | Severity | Finding | Resolution |
|---|---|---|---|
| 1 | Required | Baseline commit tracked `.claude/settings.local.json` and `scheduled_tasks.lock` (swept in by `git add -A`) | Untracked and ignored (`45ac51b`). They remain in the baseline commit's history; no remote exists yet. |
| 2 | Required | Under paged.js, `chevron` and `facet` left page 1 almost empty (text reached 25% and 14% of the page): the nested two-column grid moved to page 2 as a unit | Template root is now the grid with the header spanning both columns, as in `meridian`/`harbor` (`a09aa19`). Page 1 now 87–88%. `banner` aligned (unchanged at 95%). |
| 3 | Required | Level/score logic copied into seven templates | `resolveLanguages` in `templates/shared.ts` (`1742f2e`). |
| 4 | Required | Skill names broke mid-word in the narrow sidebars ("TypeScrip t") | Row wraps; marks drop below the name (`7d58476`). |
| 5 | Required | The v1→v2 migration step was redundant with `normalize`; deleting it kept all tests green (surviving mutation) | `normalize` no longer converts strings; the step is load-bearing and tested. |
| 6 | Required | 002 criterion "undo/redo treats the CV language like any other edit" was ticked without a test | Test added (store tracks `data` deeply, so it passed). |

## Verified, no change needed

- Mutation experiments (flip `onAccent`, weaken `accentText`, drop the CEFR word boundary,
  accept non-integer levels, leave a `level: undefined` key): all caught by tests.
- Photo renders in the 8 photo-capable templates (checked in the browser with an uploaded image).
- Multi-page: paged preview and HTML export printed to PDF for seven templates (2 pages A4).
- Security: link `href`s go through `absoluteUrl` (a `javascript:` value becomes `https://javascript:…`);
  SVG thumbnails and shapes are static; the photo is an object URL. No new dependencies.
- A paginated-preview "hang" seen while scripting browser measurements did not reproduce in
  isolation (`compact` renders in ~0.8 s and the page count is stable); treated as an artifact of
  the measurement script, not an app defect.

## Left open on purpose

- **FYI** `.cv-page h1,h2,h3 { break-after: avoid }` already exists in `print.css`, but paged.js does
  not honour `avoid`, so a section heading can end a page alone (seen with "Charlas"). Pre-existing.
- **FYI** Sidebar bands (`modern`, `meridian`, `harbor`) cover page 1 only; page 2+ has no band.
  Pre-existing behaviour of `modern`, inherited by the new sidebar templates.
- **Optional** Move colour math (`contrastRatio`, `onAccent`, `accentText`) from `templates/shared.ts`
  (≈230 lines) to `src/core/color.ts`.
- **Optional** `LevelDots.vue` now draws dots, stars, bars and dashes; `LevelMarks.vue` would be a truer name.
- **Nit** Every skill-name input in `SkillItemsEditor` has the same `aria-label`; include the position.
- **Nit** `accentText` has an unreachable `#000000` fallback (white has 21:1 against black).
- Not exercised: the browser's native print dialog (`window.print`) path; only HTML→PDF and paged preview.
