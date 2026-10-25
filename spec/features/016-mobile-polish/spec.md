# 016 · Mobile polish

**Status:** implemented ✅

## What it does

Gives the form back its height on phones and makes the editor use the space of tablets and of a phone
held sideways. On a phone (≤ 640px): one-row header with a menu sheet, a compact step bar with
previous / next arrows, a one-row dock, no persistent storage notice in the editor. Between 641px and
1000px (tablets, phone in landscape): form and live preview side by side, no dock.

## Why

Measured on the published site in an emulated 390×664 viewport (the usable height with the browser
bar): header 121px, notice 56px, step card ~90px and dock ~125px left ~270px for the form, one field
and a half. The 641–1000px range still showed one pane at a time with a tab strip, wasting a tablet.
Design reference: artifact "CV Maker responsive" (8 artboards: phone, small phone, landscape, tablets).

## Acceptance criteria

- [x] ≤ 640px: the header is one row (brand, save state, undo, redo, menu); language, theme, My CVs and Import live in a menu sheet. All targets are ≥ 44px.
- [x] ≤ 640px: the "may be erased by the browser" notice is not shown in the editor; the same text is in the menu sheet. The private-mode warning still shows.
- [x] ≤ 640px: the step bar is ≤ 64px, has previous / next arrows and opens the step sheet from its centre.
- [x] ≤ 640px: the dock is one row: Edit/Preview switch plus Next (Export in preview).
- [x] ≤ 640px, 390×664: the form area is at least 440px tall in the personal step.
- [x] ≤ 640px: the preview has no title row and its page is not covered by the dock.
- [x] 641–1000px: form and preview are both visible (preview fitted to its column), the dock is hidden and Back / Next are in the form footer.
- [x] Phone in landscape (≥ 641px wide, ≤ 500px tall): the editor is usable without the form shrinking below ~200px.
- [x] No horizontal overflow at 320, 360, 390, 430, 768, 844, 1024px.
- [x] ≥ 1001px is unchanged.

## Out of scope

- Style step and step sheet redesign beyond what 013 delivered.
- Field error states and the open on-screen keyboard (not designed yet).
- Real-device testing.

## Verification

Chromium at 320×568, 360×640, 390×664, 430×740, 768×1024, 844×390, 1024×768 and 1280×800: no horizontal
overflow at any of them. At 390×664 the header is 52px, the dock 70px and the wizard (step bar plus form)
542px, against ~270px for the form before. At 844×390 both panes show and the wizard is 332px tall. The
phone flow (preview, export sheet, menu sheet, My CVs) was walked at 390 and 320 without errors; the
dock label no longer wraps at 320. The ≥ 1001px layout is unchanged.

Not covered: real devices, the on-screen keyboard, field error states, a form step with many fields in
landscape (the fields are still one column there), and My CVs dates, which still truncate at 320px.
