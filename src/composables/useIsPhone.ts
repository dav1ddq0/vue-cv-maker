import { onBeforeUnmount, onMounted, ref } from 'vue'

/** Width at or below which the touch-first phone shell applies (spec 013). */
export const PHONE_MAX_WIDTH = 640
export const PHONE_QUERY = `(max-width: ${PHONE_MAX_WIDTH}px)`

/**
 * Reactive "is this a phone-sized viewport". Only for places that must branch in script (which
 * component to mount); anything that is just layout belongs in CSS with `PHONE_QUERY`.
 * Falls back to `false` where `matchMedia` does not exist (tests, old browsers).
 */
export function useIsPhone() {
  const supported = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
  const query = supported ? window.matchMedia(PHONE_QUERY) : undefined
  // Read synchronously so a phone never paints the desktop layout first.
  const isPhone = ref(query?.matches ?? false)
  const update = (event: { matches: boolean }) => {
    isPhone.value = event.matches
  }

  onMounted(() => query?.addEventListener('change', update))
  onBeforeUnmount(() => query?.removeEventListener('change', update))

  return isPhone
}
