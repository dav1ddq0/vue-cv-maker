# 020 · Plan

1. Spec, plan, tasks.
2. Favicon, default base path, README deployment section, tech-stack doc, CI Node 24.
3. Photo: `accept` narrowed to the three raster types, 5 MB limit checked before `savePhoto`; i18n; tests.
4. Roadmap; close.

## Decisions

- **5 MB**: a phone photo is usually 2–4 MB; the stored blob is per CV in IndexedDB, and templates show it
  at a few centimetres, so anything larger only costs quota.
- **SVG excluded**: not a photo, and the 017 import rules already drop it from JSON files.
