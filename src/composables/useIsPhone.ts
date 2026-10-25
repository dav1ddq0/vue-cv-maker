import { onBeforeUnmount, onMounted, ref } from 'vue'

/** Width at or below which the touch-first phone shell applies (spec 013). */
export const PHONE_MAX_WIDTH = 640
export const PHONE_QUERY = `(max-width: ${PHONE_MAX_WIDTH}px)`

/** Width at or below which the preview has no half of the screen to itself (spec 016). */
export const COMPACT_MAX_WIDTH = 1000
export const COMPACT_QUERY = `(max-width: ${COMPACT_MAX_WIDTH}px)`

/** Above the compact range: the three-column desktop editor (spec 018). */
export const DESKTOP_QUERY = `(min-width: ${COMPACT_MAX_WIDTH + 1}px)`

/**
 * Reactive "is this a phone-sized viewport". Only for places that must branch in script (which
 * component to mount); anything that is just layout belongs in CSS with `PHONE_QUERY`.
 * Falls back to `false` where `matchMedia` does not exist (tests, old browsers).
 */
export function useIsPhone() {
  return useMediaQuery(PHONE_QUERY)
}

/** Phones, tablets and a phone held sideways: anywhere the preview is a narrow column or a page of its own. */
export function useIsCompact() {
  return useMediaQuery(COMPACT_QUERY)
}

/** Wide screens: step rail, form and preview side by side. */
export function useIsDesktop() {
  return useMediaQuery(DESKTOP_QUERY)
}

function useMediaQuery(source: string) {
  const supported = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
  const query = supported ? window.matchMedia(source) : undefined
  // Read synchronously so a phone never paints the desktop layout first.
  const matches = ref(query?.matches ?? false)
  const update = (event: { matches: boolean }) => {
    matches.value = event.matches
  }

  onMounted(() => query?.addEventListener('change', update))
  onBeforeUnmount(() => query?.removeEventListener('change', update))

  return matches
}
