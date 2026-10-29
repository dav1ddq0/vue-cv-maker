# 039 · The app is called Keireki Craft

**Status:** implemented ✅

## What it does

"CV Maker" becomes **Keireki Craft** ("keireki" is Japanese for career or résumé), a more original
name. The user's choices: rename the browser storage with a migration, rename the package, and use
"KC" in the logo mark.

1. **What the user sees.**
   - The app name in Spanish and English (`app.name`), the tab title, the import hint, the "Creator"
     field of the direct PDF, the header mark (`KC`) and the favicon.
   - The README, `CLAUDE.md`, `spec/README.md` and the mission. The specs 001–038 keep the old
     name: they describe the project as it was.
2. **Names inside the code.** `package.json` and the lockfile (`keireki-craft`), the Vite plugin
   name, the IndexedDB database (`keireki-craft`) and the preferences key (`keireki-craft:prefs`).
3. **Nothing is lost for an existing install.**
   - Preferences: `readPrefs` falls back to `cv-maker:prefs` while the new key is empty; the next
     write goes to the new key. The old key is never written.
   - Documents and photos: before its first read the storage copies the `cv-maker` database into
     `keireki-craft` (`services/storage/legacy.ts`), once, in a single transaction (all or nothing).
     It runs only while the new database has no CV index. A failure is thrown to the caller and tried
     again on the next call, so the app never carries on with an empty store.
   - The old database is left in place as a backup; clearing the site's data in the browser removes
     it. A browser that never had one gets no empty database left behind.

## Not changed

- The repository name, the GitHub Pages path (`/vue-cv-maker/`), `BASE_PATH` and the deploy
  workflow: they belong to the repository, which is the owner's to rename. If it is renamed, the
  `base` in `vite.config.ts`, `qa/lib/server.cjs` and the README change with it.
- The `cv` in the data model, the file names (`<name> – CV.pdf`) and the word "CV" in the interface:
  they are what the document is called.

## Acceptance criteria

1. [x] The interface, the tab, the favicon and the PDF metadata say Keireki Craft.
2. [x] An install from before the rename finds its CVs, photo and preferences after the update.
3. [x] A browser with no old data ends with no `cv-maker` database.

## Verification

- 516 unit tests, plus the typecheck. New: preferences fallback (4 cases).
- `qa:e2e` 90/90, with a new block, `rename`: an old install is set up in a real browser (data moved
  back to `cv-maker`, new database deleted, old preferences), and after loading the app the CV, the
  photo, the preferences and the title are there. Without the copy, 3 of its checks fail.
- Header screenshots on desktop and a Pixel 7 profile.
