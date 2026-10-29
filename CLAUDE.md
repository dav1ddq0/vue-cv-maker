# Keireki Craft

A local-first CV editor: guided form, live preview and an extensible template
system. Everything runs in the browser — no account, no server, no connection
required.

## Stack

- Language: TypeScript
- Framework / runtime: Vue 3 (Composition API, `<script setup>`) + Vite + Pinia
- Storage: IndexedDB (via `idb-keyval`), behind a `StorageAdapter` interface — no backend
- Tests: Vitest (`tests/**/*.test.ts`), covering the pure layers (model, migrations, import heuristics, template contracts)

## Commands

- `npm run dev` — starts the local dev server
- `npm test` — runs the Vitest suite
- `npm run typecheck` — `vue-tsc --noEmit`
- `npm run build` — type-checks then production build; this plus `npm test` is the pre-PR check

## Project structure

```
src/
├── types/cv.ts          the central contract — everything else depends on it
├── core/                model factories, schema migrations, history, debounce
├── stores/               cv (data + undo/redo + autosave), ui (view state)
├── services/
│   ├── storage/          StorageAdapter interface + IndexedDB implementation
│   ├── export/           render → HTML / print / JSON; paged.js lives only here
│   └── pdfImport/        extract (pdf.js) → analyze (heuristics) → assemble
├── templates/            one folder per template, auto-registered via templates/registry.ts
├── components/           organized by feature (form/, preview/, import/, documents/, ui/)
├── composables/          reusable stateful logic (e.g. useValidation, useCapabilities)
└── i18n/                 en/es strings
```

## Conventions

- Composition API with `<script setup lang="ts">` in every `.vue` component.
- CV state is centralized in `stores/cv.ts` via Pinia — don't duplicate local state that belongs there.
- `src/types/cv.ts` is the shared contract: any change to it needs a matching entry in `src/core/migrations.ts`.
- A new template lives entirely under `src/templates/<name>/` and self-registers in `templates/registry.ts` — no changes to consuming code.
- Path alias `@/` maps to `src/` — use it for all internal imports.

## Don'ts

- Do not commit without the user's explicit approval.
- Do not create Pull Requests without the user's explicit approval.
- Do not delete any files, code, or configuration. First propose deletions and explain the rationale and expected impact.
- Do not make unsolicited changes, even improvements or refinements.
- Do not install dependencies or modify `package.json`, lockfiles, or dependency manifests without confirmation.

## Workflow

- Before a non-trivial task (multiple files, an architecture or design decision), propose a plan and wait for the OK before touching code.
- One task at a time; when done, summarize what changed so it can be reviewed.
- If you're not at least 80% sure, ask. Never invent.
- New features follow the spec-driven process in `spec/` — see `spec/README.md`.
