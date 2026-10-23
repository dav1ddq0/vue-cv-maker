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
  const isPhone = ref(false)
  let query: MediaQueryList | undefined
  const update = (event: { matches: boolean }) => {
    isPhone.value = event.matches
  }

  onMounted(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    query = window.matchMedia(PHONE_QUERY)
    isPhone.value = query.matches
    query.addEventListener('change', update)
  })
  onBeforeUnmount(() => query?.removeEventListener('change', update))

  return isPhone
}
