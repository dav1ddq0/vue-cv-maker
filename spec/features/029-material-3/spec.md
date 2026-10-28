# 029 · Material 3 interface (dark mode and Android)

**Status:** implemented ✅

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
3. [x] **Shape, elevation, state**: M3 shape scale (none, xs 4, sm 8, md 12, lg 16, xl 28, full)
       replaces the 20 ad-hoc radii; tonal elevation levels; hover/focus/pressed state layers
       (8 / 10 / 10 % of the content colour).
4. [x] **Fonts load by need**: every bundled `@font-face` has its `unicode-range`; a Latin-only page
       downloads no Latin Extended file.

### Components (M3 equivalents)

5. [x] Buttons: filled, tonal, outlined, text and icon buttons, 40 dp tall with 48 dp targets.
6. [x] Text fields: M3 *filled* text fields (label inside the container, active indicator), with
       supporting text and the warning in the error colour. Filled rather than outlined: the outlined
       field's label notch must match the background behind it, which varies here (page or card).
7. [x] Chips (filter, with check when selected; input chips for highlights), segmented buttons and
       checkbox. (No switch exists in the interface.)
8. [x] Cards (entry, document, export option), bottom sheets (drag handle, xl top corners,
       surface-container-low), dialogs (xl corners, surface-container-high), notices.
9. [x] App chrome: top app bar, the phone dock as an M3 bottom app bar, step navigation, the desktop
       header and step rail.

### Dark mode and Android

10. [x] **"System" is the default theme**; a stored "Light" or "Dark" choice is kept. (Saving any
        preference used to store the default too, so earlier visitors may carry a stored "Light".)
11. [x] **`theme-color`** follows the resolved theme, live.
12. [x] **No glare in dark**: the template thumbnails (drawings of a page, not the CV) take the
        theme's tones; the on-screen CV paper is dimmed to 88 % brightness. Print, PDF and the HTML
        export are rendered separately and unchanged. Before the script runs, the page uses the
        system's canvas colour, so a dark phone sees no light flash.
13. [x] **48 dp touch targets** on phones for every interactive element.

### Unchanged

- The CV templates, their fonts, print and PDF output.
- Layout and flows (steps, sheets, views); this is a visual and token change.

## Verification

- 466 unit tests. New: every M3 colour pairing meets WCAG AA in light and dark; every bundled font
  face has its `unicode-range`; "System" is the first-visit default; `theme-color` follows the theme.
- Android audit (Pixel 7 profile, Chromium) on 16 screens in dark and light: no text below WCAG AA,
  no light patch in dark beyond M3's own primary, every control's touch target ≥ 48 dp (only the
  visually hidden file inputs, reached through their drop zones, are smaller).
- The E2E suite on the built site: 80/80 checks. First load: 87 KB JS, 14 KB CSS, 34 KB fonts in 6
  requests (was 176 KB of fonts in 11).
- The browser-print PDF for 13 templates × sample, long CV and a manual page break: 39/39 with the
  same page counts as before the redesign, no blank pages, the break where set.
- Latin Extended loads on demand: typing "Dvořák" fetches the latin-ext files then, not before.

## Out of scope

- Dynamic colour from the wallpaper (not exposed to web pages).
- A PWA manifest / installability: a feature of its own.
