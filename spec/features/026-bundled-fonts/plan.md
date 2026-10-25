# 026 · Plan

## Dependency (needs the user's approval: it changes `package.json` and the lockfile)

Fontsource, static packages, exact versions, all OFL-1.1, versions from 2026-07-19:

```
npm install --save-exact @fontsource/inter@5.3.0 @fontsource/source-sans-3@5.3.0 \
  @fontsource/jetbrains-mono@5.3.0 @fontsource/eb-garamond@5.3.0 @fontsource/carlito@5.3.0 \
  @fontsource/caladea@5.3.0
```

- **Static, not the variable packages**: the static ones register the families under the names the
  CVs already store (`'Inter'`, `'Source Sans 3'`…); the variable ones are `'Inter Variable'` etc.,
  which would mean rewriting every stored `fontFamily` with a migration.
- **Fontsource rather than copying files into `public/`**: versioned, with the licence alongside, and
  Vite fingerprints the files. Copying would need downloading binaries by hand and tracking them.
- **Size**: the packages are 1.4–4.3 MB each on disk, but the build only emits the `.woff2` files of the
  imported weights; each `@font-face` has a `unicode-range`, so a browser fetches only the subsets
  and families a page uses (about 20–30 KB per face for Latin).
- Alternatives weighed: Google Fonts CDN (third-party request, breaks the CSP and offline use);
  relabelling only (honest, but the default templates would still not look as designed).

## Steps

1. Spec, plan, tasks.
2. After the install: `src/styles/fonts.css` importing weights 400/600/700 and italic 400 of each
   family, imported once from `main.ts`. Label non-bundled fonts in the style step.
3. `printCv` awaits `document.fonts.ready`; the HTML export inlines the CV family's Latin faces.
   Tests.
4. Playwright check on the built site, roadmap, close.
