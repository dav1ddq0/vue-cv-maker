import { ref } from 'vue'
import { useCvStore } from '@/stores/cv'
import { downloadBlob, exportHtml, exportJson, printCv, printTitle } from '@/services/export'

/** `pdfFile` downloads the PDF directly (spec 031); `pdf` goes through the print dialog. */
export type ExportKind = 'pdfFile' | 'pdf' | 'html' | 'json'

/**
 * The exports, shared by the export step, the desktop dialog and the phone sheet. `busy` blocks
 * overlapping runs; `failed` names a direct PDF that could not be built, so the caller can offer
 * printing instead.
 */
export function useCvExport() {
  const cv = useCvStore()
  const busy = ref<ExportKind | null>(null)
  const failed = ref<ExportKind | null>(null)

  /** Runs one export; `false` when the direct PDF failed (nothing else is lost). */
  async function run(kind: ExportKind): Promise<boolean> {
    busy.value = kind
    failed.value = null
    try {
      // Autosave is debounced; flushing first means the file matches what is stored.
      await cv.flush()
      if (kind === 'pdfFile') {
        // PDFKit and the converter load here, on first use: the editor never pays for them.
        const { buildDirectPdf } = await import('@/services/export/pdfDirect')
        const title = printTitle(cv.data)
        downloadBlob(await buildDirectPdf(cv.data, cv.templateId, title), `${title}.pdf`)
      } else if (kind === 'pdf') await printCv(cv.data, cv.templateId, { paginate: true })
      else if (kind === 'html') await exportHtml(cv.data, cv.templateId)
      else await exportJson(cv.data)
      return true
    } catch (error) {
      if (kind !== 'pdfFile') throw error
      console.warn('[export] direct PDF failed; offering print instead', error)
      failed.value = kind
      return false
    } finally {
      busy.value = null
    }
  }

  return { busy, failed, run }
}
