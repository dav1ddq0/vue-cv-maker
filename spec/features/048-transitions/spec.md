# 048 · Transitions between steps, views and panes

**Status:** implemented ✅

## What it does

Before, nothing animated between screens: a step, a view or the preview appeared in place. Now:

1. **Step to step.** The form slides 16 px in the direction of travel (forward: out to the left, in
   from the right; back: the reverse) and fades: 150 ms out with the standard curve, 300 ms in with
   the decelerate curve. `CvWizard.vue`, a `<Transition mode="out-in">` keyed by the step, with the
   direction set synchronously by a watcher on `stepIndex`.
2. **View to view** (editor, My CVs, Import, welcome). A fade with an 8 px lift on the way in
   (`App.vue`, `<Transition name="view">`).
3. **Edit / Preview on a phone, and the full-width preview on desktop.** A View Transition
   (`core/viewTransition.ts`, `withViewTransition`): the old and new layout cross-fade, and on
   desktop the preview pane (`view-transition-name: cv-preview`) grows into the freed space instead
   of appearing. The toggles are store actions (`setPreviewOpen`, `setPreviewExpanded`) used by the
   dock, the preview toolbar, the style step's strip and the Escape shortcut.
4. **Progressive.** Browsers without `startViewTransition` run the same state change with no
   animation. With reduced motion, no View Transition starts and every CSS transition is cut to
   0.01 ms by the existing global rule.

## Acceptance criteria

1. [x] Moving to a later step slides forward, to an earlier one back (sampled in Chromium: opacity
   and `translateX` run through both phases, about 500 ms in all).
2. [x] The phone's Edit / Preview switch and the desktop's full-width toggle each start one View
   Transition.
3. [x] Reduced motion and browsers without the API still work: the change happens, unanimated.
4. [x] No sideways scrollbar appears while a step slides (`overflow-x: clip` on the body).

## Verification

- `tests/transitions.test.ts` (5 cases: the helper with and without the API, with reduced motion;
  the CSS rules). 617 unit tests, `vue-tsc`, `qa:e2e` 96/96, `qa:security` 55/55,
  `qa:consistency` 10/10, `qa:pdf` 119/119.
- The browser suites now wait for the page to rest (`settled` in `qa/e2e/lib.cjs`) after a step
  change and before an audit: the animation is real, and a check that read content mid-slide
  failed three times before that.
- **A transitions block in `qa:e2e`** (`qa/e2e/transitions.cjs`, 12 checks): the order of travel (out
  left then in from the right going forward; the reverse going back), six quick clicks on Next,
  alternating back and next, typed data and scroll position across steps, the full-width preview
  and Escape (one View Transition each), My CVs with a single view on screen, the phone's Edit /
  Preview switch including interruptions, no sideways scroll, no console errors, and reduced motion
  (no View Transition, no fade). Mutation-tested: a direction that is always forward and a missing
  reduced-motion guard each fail a check.
- Found by that block: with reduced motion a step still passed through one blank frame (the
  transition cut to 0.01 ms still holds the faded state for a frame), so the step and view
  transitions are neutralised under `prefers-reduced-motion: reduce`; and the wrapper class `step`
  clashed with the steps' own root `.step`, now `step-frame`.
- Tried in the local Android emulator (API 34, Chrome 113 over DevTools): the step fades and
  slides both ways, Edit / Preview starts a View Transition each way, no sideways scroll, no errors.
- Not checked on real iOS Safari.
