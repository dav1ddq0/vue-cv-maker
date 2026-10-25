# 024 · Plan

1. Spec, plan, tasks.
2. `printTitle(data)` in `services/export/pdf.ts`; `printCv` sets it around `window.print()` and
   restores it in `finally`. The note in the dialog, the Export step and the phone sheet. Tests.
3. Playwright check, roadmap, close.

## Decisions

- **`document.title`**: Chrome, Edge, Firefox and Safari all use it for the suggested PDF name; it is
  the only lever a page has over that name.
- **"– CV" suffix**: a name alone ("Nadia Martín Reyes.pdf") reads like any document; the suffix is the
  same in both UI languages, so it needs no translation.
