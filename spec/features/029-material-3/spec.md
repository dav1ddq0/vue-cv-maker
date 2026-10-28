# 029 · Material 3 interface (dark mode and Android)

**Status:** in progress 🚧

## What it does

Gives the app's interface (not the CV) the look and behaviour of Material Design 3, the design system
of modern Android, consistently in light and dark. Built in-house on M3's published tokens: no UI
library, no runtime dependency beyond the Roboto Flex font.

Chosen by the user on 2026-10-28 over Vuetify 3 and `@material/web` (bundle size, rewriting every
component and test, clashes with templates and print; `@material/web` is in maintenance mode).

## Why

The Android audit of 2026-10-28 (Pixel 7, Chrome, dark and light):

- A phone in dark mode opened the app light: the default theme was "Light", not "System".
- No `theme-color`: the status bar and Chrome's toolbar ignore the theme.
- In dark, the template thumbnails and the small preview are bare white blocks.
- The selected filter chip is a near-white pill in dark.
- Icon buttons are 44 px and menu segments 40 px; M3 asks 48 dp touch targets.
- 20 distinct corner radii and hard-coded colours across components; no shared type scale.
- Fontsource's per-subset CSS has no `unicode-range`, so every font downloads its Latin Extended
  file too (104 KB of the 176 KB fetched on first load for Inter alone).

## Acceptance criteria

### Foundations

1. [x] **Colour roles** of M3 (primary, on-primary, primary-container, secondary-container,
       surface and the five surface containers, on-surface(-variant), outline(-variant), error,
       inverse…) as CSS custom properties, generated from the current brand blue for light and dark.
       Every pairing meets WCAG AA (M3's own requirement). Existing variable names keep working.
2. [x] **Typography**: Roboto Flex for the interface (CV fonts unchanged) and M3's type scale
       (display → label) as tokens.
3. [ ] **Shape, elevation, state**: M3 shape scale (none, xs 4, sm 8, md 12, lg 16, xl 28, full)
       replaces the 20 ad-hoc radii; tonal elevation levels; hover/focus/pressed state layers
       (8 / 10 / 10 % of the content colour).
4. [x] **Fonts load by need**: every bundled `@font-face` has its `unicode-range`; a Latin-only page
       downloads no Latin Extended file.

### Components (M3 equivalents)

5. [ ] Buttons: filled, tonal, outlined, text and icon buttons, 40 dp tall with 48 dp targets.
6. [ ] Text fields: outlined, with the label, supporting text and error/warning in M3 style.
7. [ ] Chips (filter, with check when selected), segmented buttons, checkbox and switch.
8. [ ] Cards (entry, document, export option), bottom sheets (drag handle, xl top corners,
       surface-container-low), dialogs (xl corners, surface-container-high), notices.
9. [ ] App chrome: top app bar, the phone dock as an M3 bottom app bar, step navigation, the desktop
       header and step rail.

### Dark mode and Android

10. [ ] **"System" is the default theme**; a stored "Light" or "Dark" choice is kept.
11. [ ] **`theme-color`** follows the resolved theme, live.
12. [ ] **The CV paper stays white** (it is what prints) but sits on a tonal frame in dark: template
        thumbnails and the small preview no longer glare.
13. [ ] **48 dp touch targets** on phones for every interactive element.

### Unchanged

- The CV templates, their fonts, print and PDF output.
- Layout and flows (steps, sheets, views); this is a visual and token change.

## Out of scope

- Dynamic colour from the wallpaper (not exposed to web pages).
- A PWA manifest / installability: a feature of its own.
