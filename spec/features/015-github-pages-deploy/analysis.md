# 015 · GitHub Pages deployment: analysis

**Status:** analysis only, nothing changed. Target: https://dav1ddq0.github.io/vue-cv-maker/

## What already exists

- `.github/workflows/deploy.yml` (tracked since the baseline): on push to `main` and on manual
  dispatch it runs `npm ci`, `npm test`, `npm run build` with `BASE_PATH=/<repo name>/`, uploads `dist`
  and deploys with `actions/deploy-pages`. Permissions are minimal (`contents: read`, `pages: write`,
  `id-token: write`), one concurrent deployment, no secrets.
- `vite.config.ts` reads `BASE_PATH`; the default is `/cv-maker/`.
- The repository is public (an unauthenticated request returns 200).

## Verified locally

| Check | Result |
|---|---|
| `BASE_PATH=/vue-cv-maker/ npm run build` | OK; `dist/index.html` points to `/vue-cv-maker/assets/…` |
| `vite preview` under that base, Chromium | page loads; no request outside `/vue-cv-maker/`; no 4xx on any response |
| Lazy chunks | import view (pdf.js + worker) and the paginated preview (paged.js, 2 pages) both load |
| Reload on the base path | works; the CV is still there (IndexedDB) |
| Routing | none: views are state, so no `404.html` / SPA fallback is needed |
| `npm ci --dry-run` | exit 0, lockfile consistent |
| Absolute paths in code | none (`index.html` entry only, rewritten by Vite) |

## What must happen first (outside the code)

1. **Enable Pages**: repository Settings → Pages → Build and deployment → Source: **GitHub Actions**.
   Without it `deploy-pages` fails the first run ("Pages site not found"). This cannot be done from the workflow.
2. **Push `main`** (26 commits are still local). The push itself starts the first deployment; if Pages
   was enabled after it, re-run the workflow from the Actions tab.

## Findings and recommendations (none applied)

1. **Docs and default base still say `/cv-maker/`.** `README.md` (`localhost:5173/cv-maker/`) and
   `spec/constitution/tech-stack.md` name the old path; CI overrides it, so production is right, but a
   developer's local URL differs from production. Recommend changing the default `base` to
   `/vue-cv-maker/` and the two docs together.
2. **No favicon**: every load requests `/favicon.ico` and gets a 404 (a console error, harmless).
   Recommend a small `public/favicon.svg` plus `<link rel="icon">`.
3. **Node version**: CI uses Node 22, local is 24. jsdom 30 requires `^22.22.2 || ^24.15.0 || >=26`, so
   `node-version: 22` works only while setup-node resolves a recent 22.x. Recommend `24` to match local.
4. **Privacy of a shared origin**: all of an account's project sites live on `dav1ddq0.github.io`, and
   IndexedDB/localStorage are per origin, not per path. Another project hosted there could read the
   CVs stored by this one. Names are namespaced (`cv-maker`, `cv-maker:prefs`), which avoids collisions
   but not access. Acceptable if every Pages site is the owner's own code; a custom domain or a dedicated
   account/organization removes the concern. Worth one sentence in the README.
5. **Pinned actions**: workflow uses major tags (`@v4`, `@v3`). Fine for this project; pinning to SHAs is
   the stricter option if supply-chain hardening matters.
6. **Deploy gate**: the workflow runs tests before building, so a red suite blocks the deploy. Good; no
   change needed. A separate PR check (same job without deploy) would catch failures before merging.
7. **README**: no deployment section; add the URL, the Pages source setting and how to override `BASE_PATH`.

## Out of scope

- A custom domain (needs a `CNAME` and DNS), a service worker / PWA install, analytics (the product is local-first).
