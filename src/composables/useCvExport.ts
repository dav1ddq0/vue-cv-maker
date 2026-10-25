import { ref } from 'vue'
import { useCvStore } from '@/stores/cv'
import { exportHtml, exportJson, printCv } from '@/services/export'

export type ExportKind = 'pdf' | 'html' | 'json'

/** The three exports, shared by the export step and the phone dock. `busy` blocks overlapping runs. */
export function useCvExport() {
  const cv = useCvStore()
  const busy = ref<ExportKind | null>(null)

  async function run(kind: ExportKind) {
    busy.value = kind
    try {
      // Autosave is debounced; flushing first means the file matches what is stored.
      await cv.flush()
      if (kind === 'pdf') await printCv(cv.data, cv.templateId, { paginate: true })
      else if (kind === 'html') await exportHtml(cv.data, cv.templateId)
      else await exportJson(cv.data)
    } finally {
      busy.value = null
    }
  }

  return { busy, run }
}
