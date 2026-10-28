import { onScopeDispose, ref, watch } from 'vue'
import { useCvStore } from '@/stores/cv'
import { debounce } from '@/core/debounce'
import { sideColumnOverflows } from '@/services/export'

/**
 * `true` while the open CV's side column is taller than page 1 can hold, so the main column would
 * only start on page 2 (spec 033). Re-measured shortly after edits; a measurement that resolves
 * after a newer one started is dropped.
 */
export function useSideColumnFit() {
  const cv = useCvStore()
  const overflows = ref(false)
  let run = 0

  const measure = debounce(async () => {
    const token = ++run
    try {
      const result = await sideColumnOverflows(cv.data, cv.templateId)
      if (token === run) overflows.value = result
    } catch {
      if (token === run) overflows.value = false
    }
  }, 500)

  watch([() => cv.data, () => cv.templateId], () => measure(), { deep: true, immediate: true })
  onScopeDispose(() => {
    measure.cancel()
    run++
  })

  return { overflows }
}
