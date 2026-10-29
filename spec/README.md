# spec/: Spec Driven Development

> Spec-driven development (SDD) for Keireki Craft: write the spec first, then the plan, then the tasks, and only then touch the code.

## Structure

```
spec/
├── constitution/            ← stable project rules (change rarely)
│   ├── mission.md           ← what we're building and for whom
│   ├── tech-stack.md        ← technologies, conventions and limits
│   └── roadmap.md           ← feature order
└── features/                ← one folder per feature
    └── XXX-feature-name/
        ├── spec.md          ← what it does + acceptance criteria
        ├── plan.md          ← how it's implemented
        └── tasks.md         ← task checklist
```

## Workflow for a new feature

1. Create `features/XXX-feature-name/` with the next free number (`001`, `002`, …).
2. Write `spec.md`: what it does, why, and measurable acceptance criteria.
3. Write `plan.md`: technical approach and decisions, respecting `constitution/tech-stack.md`.
4. Break it down into `tasks.md` and track progress.
5. Implement and validate (`npm test` + `npm run build`).
6. Update `constitution/roadmap.md` (move the feature to "Done").

> The constitution rules: if a feature conflicts with `mission.md` or `tech-stack.md`, the feature gets rethought; not the constitution.
