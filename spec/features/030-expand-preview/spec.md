# 030 · Expand the preview (desktop)

**Status:** in progress 🚧

## What it does

On desktop the preview is a column beside the form: 596 px at 1440 px wide, so the page shows at
70 % and is hard to read. "Expand preview" gives the page the whole editor, inside the app: the step
rail folds to an M3 navigation rail (step badges only), the form steps aside, and the preview takes
the rest. Chosen by the user on 2026-10-28 over a full-screen viewer and a draggable divider.

It also fixes a bug found while checking: zoomed past the panel's width, the page was cut on the
left and the cut part could not be scrolled to.

## Acceptance criteria

1. [ ] **Expand / collapse**: an icon button in the preview toolbar (desktop only), "Expand preview" /
       "Collapse preview", with `aria-pressed`. Expanded: the form is hidden, the rail shows only the
       step badges (each still named for assistive technology and with a tooltip), the preview fills
       the rest of the editor. The header stays.
2. [ ] **Ways back**: the same button, Esc (when no dialog is open), or picking a step in the rail
       (that step's form is shown again).
3. [ ] **Zoom follows**: unless the user picked a zoom, the page refits to the wider panel (still at
       most 100 %; + still reaches 120 %).
4. [ ] **Session state only**: not stored; leaving the editor or narrowing below desktop width
       shows the normal layout.
5. [ ] **Zoom never cuts the page**: at any zoom the whole page can be reached by scrolling, and it
       stays centred while it fits.
6. [ ] **M3 toolbar**: zoom out / in and expand are M3 icon buttons with 48 dp targets.

## Out of scope

- A full-screen (Fullscreen API) page-by-page viewer and a draggable divider: the other two
  proposals, not chosen.
