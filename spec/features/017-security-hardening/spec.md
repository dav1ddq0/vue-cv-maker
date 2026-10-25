# 017 · Security hardening

**Status:** implemented ✅

## What it does

Closes the findings of the security review of 2026-10-25: an imported CV can no longer make the browser
contact a third-party server, the page ships a Content-Security-Policy, the deploy workflow gives the
publishing permissions only to the job that publishes, and the dependency advisory is fixed.

## Why

Verified with a crafted JSON in Chromium: `style.accentColor: "url(https://…)"` was copied unchecked by
`normalize()` into a CSS variable that the templates paint as a background, so opening someone else's
CV made a request to their server (who opened it, from which IP). The same values travel into the
exported `.html`. In the workflow, `pages: write` and `id-token: write` were granted at workflow level,
so the build job — which runs `npm ci` and every dependency's install scripts — could publish the site.

## Acceptance criteria

- [x] `normalize()` keeps `accentColor` only as `#rgb` / `#rrggbb`, `fontFamily` only from `FONT_OPTIONS`, `pageMargin` only from the margin list; anything else falls back to the default. Tests cover each.
- [x] `personal.photo` is kept only as a `photo:` reference or a `data:image/(png|jpeg|webp|gif)` URL.
- [x] The personal text fields and link label / url are coerced to strings.
- [x] Every template's default style passes the same validation (test), so no legitimate value is reset.
- [x] `index.html` carries a CSP meta tag; the app, the PDF import (pdf.js worker) and the paginated preview / print (paged.js) still work.
- [x] The crafted JSON from the review no longer triggers any request.
- [x] The workflow grants `contents: read` by default and `pages` / `id-token` only to `deploy`; third-party actions are pinned by commit SHA.
- [x] `npm audit --omit=dev` reports no advisory (what ships to the browser and to the build).

## Out of scope

- The shared `dav1ddq0.github.io` origin (needs a custom domain or a dedicated account: the owner's call).
- `frame-ancestors` / clickjacking: not settable from a meta tag on GitHub Pages.
- Size limits for imported files and fuzzing the PDF import.

## Verification

- Unit tests: 336 pass, including the crafted style values, photo forms, non-string personal fields and a
  check that every template default passes the same validation.
- Built site (`vite preview`, Chromium): the crafted JSON from the review imports, the template renders
  with the default accent and no request reaches the fake third-party host. With the CSP in place the
  sample CV, the paginated preview (paged.js), the PDF import (pdf.js worker, a PDF made by Chromium:
  name detected) and a photo upload all work with no CSP violation; an injected inline `<script>` and an
  external `<img>` are both blocked.
- `npm audit --omit=dev`: 0. `npm audit fix` changed only the lockfile (source-map-js 1.2.1 → 1.2.2,
  vite 6.4.3 → 6.4.5, undici, brace-expansion); `package.json` untouched; tests and build pass.

Follow-up: vitest 3 → 5.0.5 (installed by the owner) cleared the dev-only advisories (`@vitest/mocker`,
`tinypool`); full `npm audit`: 0, 336 tests, typecheck and build pass. The first deploy with the new
workflow (run 40205148648, `ffbdef9`) succeeded, and the live site carries the CSP: sample, paginated
preview, PDF import and the crafted JSON checked there with no violation and no third-party request.
