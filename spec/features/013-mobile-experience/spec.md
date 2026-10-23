# 013 · Mobile experience

**Status:** proposed

## What it does

On phone-sized screens (≤ 640px) the editor becomes a touch-first flow: one step per screen, the
primary actions in a bottom dock within thumb reach, a bottom sheet to jump between steps (with the
state of each), a sticky live preview while choosing template and style, and a full-screen preview
whose main action is "Download PDF". Desktop and tablet layouts do not change.

Design reference: the approved mock-up "CV Maker móvil" (6 artboards: My CVs, edit a step, step
picker, add section, template and style, preview and export).

## Why

The responsive review (010) made the desktop layout fit a phone, but it is still the desktop UI
squeezed: a horizontal tab strip of 9 steps, controls at the top, a preview hidden behind a toggle.
A phone needs the reverse: actions at the bottom, fewer things per screen, big targets.

## Acceptance criteria

- [ ] ≤ 640px: bottom dock with the Edit / Preview switch and Back / Next; above 640px nothing changes.
- [ ] A step header ("Step 3 of 9 · Experience") with a segmented progress bar opens the step picker sheet.
- [ ] The picker lists all 9 steps with their state (current, complete, incomplete, optional); computed by a pure, tested function.
- [ ] Sheets are native `<dialog>` (focus trap, Esc, backdrop), close on backdrop tap and on the close button.
- [ ] "Add section" opens the preset sheet (012) on phones.
- [ ] Template and style: the preview stays visible while scrolling the controls; templates in a snap carousel.
- [ ] Full-screen preview shows the page fitted to width with "Download PDF" as the primary action.
- [ ] Every target ≥ 44px; no horizontal overflow at 320/360/390/430px; respects safe-area insets.
- [ ] No new dependencies; existing keyboard and screen-reader behaviour is kept.

## Out of scope

- Redesign of tablet/desktop; gestures such as pinch-zoom or swipe between steps (later, if wanted).
- Native app, PWA install, offline caching changes.
- New fields or sections (014+).
