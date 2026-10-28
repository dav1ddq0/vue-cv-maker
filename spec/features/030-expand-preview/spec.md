# 030 · Expand the preview (desktop)

**Status:** implemented ✅

## What it does

On desktop the preview is a column beside the form: 596 px at 1440 px wide, so the page shows at
70 % and is hard to read. "Expand preview" gives the page the whole editor, inside the app: the step
rail folds to an M3 navigation rail (step badges only), the form steps aside, and the preview takes
the rest. Chosen by the user on 2026-10-28 over a full-screen viewer and a draggable divider.

It also fixes a bug found while checking: zoomed past the panel's width, the page was cut on the
left and the cut part could not be scrolled to.

## Acceptance criteria

1. [x] **Expand / collapse**: an icon button in the preview toolbar (desktop only), "Expand preview" /
       "Collapse preview", with `aria-pressed`. Expanded: the form is hidden, the rail shows only the
       step badges (each still named for assistive technology and with a tooltip), the preview fills
       the rest of the editor. The header stays.
2. [x] **Ways back**: the same button, Esc (when no dialog is open), or picking a step in the rail
       (that step's form is shown again).
3. [x] **Zoom follows**: unless the user picked a zoom, the page refits to the wider panel (still at
       most 100 %; + still reaches 120 %).
4. [x] **Session state only**: not stored; leaving the editor or narrowing below desktop width
       shows the normal layout.
5. [x] **Zoom never cuts the page**: at any zoom the whole page can be reached by scrolling, and it
       stays centred while it fits.
6. [x] **M3 toolbar**: zoom out / in and expand are M3 icon buttons with 48 dp targets.

## Verification

- 471 unit tests. New: the frame is sized to the scaled page; the expanded state collapses on picking
  a step or leaving the editor; the toggle is offered on desktop only and reports `aria-pressed`;
  the folded rail names every step.
- Chromium, built site, 1440 px light and 1920 px dark: expanding widens the preview 596 → 1352 px
  (1440) and 836 → 1832 px (1920); the page refits 70 % → 100 % at 1440 (it was already at the 100 %
  cap at 1920); the form steps aside and the rail folds to nine named badges; Esc with the export
  dialog open closes only the dialog, a second Esc collapses; picking a step in the folded rail
  opens its form; below desktop width the normal layout returns; no page scroll, no console errors.
- Zoom: at 120 % the whole page (both edges and the foot) is reachable by scrolling; fitted it is
  centred with no horizontal scrollbar; phone and tablet do not overflow.
- The E2E suite: 80/80.

## Out of scope

- A full-screen (Fullscreen API) page-by-page viewer and a draggable divider: the other two
  proposals, not chosen.
