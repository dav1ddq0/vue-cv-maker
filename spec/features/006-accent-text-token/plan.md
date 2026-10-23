# 006 · Plan

1. `accentText` in `templates/shared.ts` (darken by mixing with black in 5% steps until the
   contrast with white reaches 4.5:1), `--cv-accent-text` in `styleVars`, with tests.
2. Replace `color: var(--cv-accent)` by `color: var(--cv-accent-text)` in all 13 templates.

Two commits, recorded in `tasks.md`.
