# 020 · Housekeeping: deploy details and photo checks

**Status:** implemented ✅

## What it does

Closes the small items left open by the 015 analysis and one P2 input check from the 011 gap analysis:
a favicon, the default base path matching production, a deployment section in the README, Node 24 in
CI, photo type and size checks, and an up-to-date roadmap.

## Why

- Every load requested `/favicon.ico` and got a 404 (console error on the live site).
- The default `base` (`/cv-maker/`) differs from the published path (`/vue-cv-maker/`), so local
  preview and production behave differently and the README points at the wrong URL.
- CI runs Node 22 while development runs 24; jsdom 30 needs a recent 22.x, so CI depends on
  setup-node resolving one.
- The photo input accepted any `image/*` (SVG, HEIC…) of any size, while the hint says "JPG, PNG, WebP".
- The roadmap still ends at 014.

## Acceptance criteria

- [x] `public/favicon.svg` linked from `index.html`; no 404 on load.
- [x] Default `base` is `/vue-cv-maker/`; README, tech-stack doc and the dev URL agree; `BASE_PATH` still overrides it.
- [x] README has a Deployment section (URL, Pages source setting, `BASE_PATH`).
- [x] CI uses Node 24.
- [x] The photo accepts JPG, PNG and WebP only, up to 5 MB; a larger file shows a message with its size and nothing is stored.
- [x] Roadmap lists 015–020.

## Out of scope

- Photo crop / zoom (needs its own design), the shared `github.io` origin (needs a custom domain).

## Verification

- 378 unit tests (new: photo rules, the photo field refusing a 6 MB file and storing a small one).
- Built site (`vite preview` at `/vue-cv-maker/`): no response ≥ 400 on load (the favicon request
  returns 200), no CSP violation. `dist/index.html` links `/vue-cv-maker/favicon.svg`.
- CI on Node 24 is only verifiable on the next push to `main`.
