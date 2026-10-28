# 029 · Plan

1. Spec, plan, tasks.
2. **Foundations** (items 1–4): colour roles, Roboto Flex + type scale, shape/elevation/state tokens,
   `unicode-range` on every face. Existing variables (`--bg`, `--surface`, `--accent`…) become aliases
   of the M3 roles, so components keep working before they are restyled.
3. **Base components** (items 5–8): `BaseButton`, `BaseField`, chips/segmented/checkbox, `EntryCard`,
   `BottomSheet`, dialogs, `NoticeBar`.
4. **Screens** (item 9): top app bar, dock, step navigation, desktop header and rail, welcome,
   My CVs, import, export, style gallery.
5. **Dark mode and Android** (items 10–13): System default, `theme-color`, tonal frame for the CV
   paper and thumbnails, 48 dp targets.
6. Verify: unit tests, the E2E suite, the Android audit in dark and light with screenshots, the
   browser-print PDF checks; roadmap; close.

## Decisions

- **No UI library.** M3 is a set of published tokens and component specs; implementing them in the
  existing components keeps the bundle (87 KB JS) and the tests, and avoids a framework's global
  styles reaching the CV templates or print.
- **Colour roles without a dependency.** M3 tones are CIELAB L* values; the tonal palettes are
  generated once by a script (L* tones at the seed's hue, chroma clamped to sRGB) and the resulting
  hex values are written into `app.css`. Contrast guarantees follow from L*, so they hold; a test
  checks every role pairing.
- **Roboto Flex** from `@fontsource-variable/roboto-flex@5.3.0` (variable: one file per subset for
  all weights). Installed by the user. Inter stays as a CV font option.
- **`unicode-range`**: `fonts.css` declares the faces itself (Latin and Latin Extended, with M3's
  ranges from Fontsource's combined CSS) pointing at the package files, instead of importing the
  per-subset CSS that lacks the range. A test fails if a face has no range.
- **CV paper in dark**: stays `#fff`; dark mode adds a surface-container frame and M3 elevation
  around it, and dims nothing inside it (what you see is what prints).
