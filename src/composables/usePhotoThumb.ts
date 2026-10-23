import { onUnmounted, ref, watch } from 'vue'
import { loadPhoto } from '@/services/storage'

/**
 * An object URL for the stored photo behind `reference` (`photo:{id}`), kept in sync with it and
 * revoked when it changes or the component unmounts.
 *
 * The reference is stable per CV (an upload replaces the blob under the same id), so callers
 * also call `refresh()` after saving a new photo. A stale read never overwrites a newer one.
 */
export function usePhotoThumb(reference: () => string | undefined) {
  const thumbUrl = ref<string | null>(null)
  let request = 0

  async function refresh() {
    const current = ++request
    const ref_ = reference()
    let url: string | null = null
    if (ref_?.startsWith('photo:')) {
      try {
        const blob = await loadPhoto(ref_)
        if (blob) url = URL.createObjectURL(blob)
      } catch {
        // The thumbnail is only a convenience; a failed read must not look like a failed upload.
      }
    }
    if (current !== request) {
      if (url) URL.revokeObjectURL(url)
      return
    }
    if (thumbUrl.value) URL.revokeObjectURL(thumbUrl.value)
    thumbUrl.value = url
  }

  watch(reference, refresh, { immediate: true })
  onUnmounted(() => {
    request++
    if (thumbUrl.value) URL.revokeObjectURL(thumbUrl.value)
    thumbUrl.value = null
  })

  return { thumbUrl, refresh }
}
