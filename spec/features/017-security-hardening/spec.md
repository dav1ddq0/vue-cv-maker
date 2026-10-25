# 017 · Security hardening

**Status:** in progress

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

- [ ] `normalize()` keeps `accentColor` only as `#rgb` / `#rrggbb`, `fontFamily` only from `FONT_OPTIONS`, `pageMargin` only from the margin list; anything else falls back to the default. Tests cover each.
- [ ] `personal.photo` is kept only as a `photo:` reference or a `data:image/(png|jpeg|webp|gif)` URL.
- [ ] The personal text fields and link label / url are coerced to strings.
- [ ] Every template's default style passes the same validation (test), so no legitimate value is reset.
- [ ] `index.html` carries a CSP meta tag; the app, the PDF import (pdf.js worker) and the paginated preview / print (paged.js) still work.
- [ ] The crafted JSON from the review no longer triggers any request.
- [ ] The workflow grants `contents: read` by default and `pages` / `id-token` only to `deploy`; third-party actions are pinned by commit SHA.
- [ ] `npm audit` reports no high-severity advisory.

## Out of scope

- The shared `dav1ddq0.github.io` origin (needs a custom domain or a dedicated account: the owner's call).
- `frame-ancestors` / clickjacking: not settable from a meta tag on GitHub Pages.
- Size limits for imported files and fuzzing the PDF import.
