# 017 · Plan

## Implementation

1. Spec, plan, tasks.
2. `core/stylePresets.ts`: `PAGE_MARGINS`, `isAccentColor`, `isFontOption`; `core/migrations.ts`: validate `style`, `photo`, personal strings and links; `StepStyle.vue` reads `PAGE_MARGINS`; tests.
3. CSP meta in `index.html`; check dev, build preview, PDF import and paginated preview.
4. Workflow permissions per job and SHA-pinned actions.
5. `npm audit fix` (lockfile only), tests and build, close.

## Decisions

- **Validate at the boundary** (`normalize`, which every import and every load goes through), not in the templates: one place, and the templates keep trusting typed data.
- **Fall back to the default, don't reject the file**: a lossy import beats a failed one (same rule as the rest of `normalize`).
- **CSP in a meta tag**: GitHub Pages cannot send headers. `style-src 'unsafe-inline'` stays: Vue style bindings and paged.js need it; the risk it leaves is what step 2 closes.

## Risks

- **A legitimate stored value outside the lists** would reset to the default on load: only values the UI could never produce, and a template test guards the defaults.
- **CSP breaking a lazy chunk or a worker**: verified by hand in task 3.
