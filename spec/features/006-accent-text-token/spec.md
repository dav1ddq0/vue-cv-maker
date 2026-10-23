# 006 · Accent colour for text on light backgrounds

**Status:** proposed

## What it does

Text that is drawn in the accent colour on a white (or tinted-white) surface (headlines,
company names, section titles) uses a derived colour: the accent itself when it already
reads well, otherwise the accent darkened until it reaches 4.5:1 against white. Fills,
borders and shapes keep the exact accent the user picked.

## Why

The palette offers yellow, green and coral. Section titles and company names in those
colours on white are hard to read in every template that uses accent text, and 005 only
fixed the opposite case (text on accent-filled areas).

## Acceptance criteria

- [ ] `accentText(hex)` returns the accent unchanged when its contrast with white is already
      at least 4.5:1, and otherwise a darkened shade of the same hue that reaches 4.5:1.
      Invalid input is returned unchanged. Pure function, tested.
- [ ] `styleVars` exposes it as `--cv-accent-text`.
- [ ] Every template uses `var(--cv-accent-text)` for accent-coloured text; backgrounds,
      borders, rules and shapes still use `var(--cv-accent)`.
- [ ] Test: for each palette colour and each template default accent, the text colour has at
      least 4.5:1 against white.
- [ ] Existing contract tests keep passing (templates still read the accent token).
- [ ] Checked in the browser with the yellow accent; `npm test`, typecheck and build pass.

## Out of scope

- Text on accent-filled areas (done in 005).
- `modern`'s white text on its accent sidebar (separate, pre-existing).
