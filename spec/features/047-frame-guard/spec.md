# 047 · A guard against being framed

**Status:** implemented ✅

## What it does

Applies the one actionable item of the security review: clickjacking. `frame-ancestors` cannot be set
from the CSP meta tag, and GitHub Pages sends no headers (spec 017 left it out), so the app now
refuses to start when another page frames it: it shows a single link that opens it on its own and
mounts nothing. `core/frameGuard.ts` (`isFramed`, `showFramedNotice`), called from `main.ts`.

`isFramed` is true when `window.top !== window.self`, or when reading `top` throws (a cross-origin
parent). The notice is built with DOM calls, which the CSP allows.

## Not changed, on purpose

- `style-src 'unsafe-inline'` stays: Vue style bindings and paged.js need it, and what it would allow
  a hostile file is closed by the validation in `core/migrations.ts`.
- If the site is ever served where headers can be sent, add `frame-ancestors 'none'` too; this guard
  is the fallback for hosts that cannot.
- Dependency advisories are caught by `npm audit` (0 at the time of writing); reviewing lockfile
  diffs by hand when updating packages is a practice, not code.

## Acceptance criteria

1. [x] Framed by another page, the app mounts nothing and offers one link.
2. [x] Opened normally, it starts as before.

## Verification

- `tests/frameGuard.test.ts` (3 cases); `qa:security` 55/55, with a check that frames the built app
  (it fails with the guard disabled: 22 buttons rendered); 612 unit tests, `vue-tsc`, `qa:e2e` 96/96.
