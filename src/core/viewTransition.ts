import { nextTick } from 'vue'

type Transitionable = Document & { startViewTransition?: (update: () => Promise<void>) => unknown }

/**
 * Runs `update` (a state change that re-renders the page) inside a View Transition where the
 * browser has them, so the old and the new layout cross-fade and named elements move between their
 * boxes (spec 048). Without the API, or when the person asks for reduced motion, it just runs
 * `update`: the same change, with no animation.
 */
export function withViewTransition(update: () => void, doc: Transitionable = document): void {
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced || typeof doc.startViewTransition !== 'function') {
    update()
    return
  }
  // The browser takes the "after" picture once this settles: Vue renders on the next tick.
  doc.startViewTransition(async () => {
    update()
    await nextTick()
  })
}
