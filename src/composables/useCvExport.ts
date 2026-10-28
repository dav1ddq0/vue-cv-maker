import { computed, ref } from 'vue'
import { useCvStore } from '@/stores/cv'
import { downloadBlob, exportHtml, exportJson, printCv, printTitle } from '@/services/export'
import { FONT_OPTIONS } from '@/core/stylePresets'

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

  /**
   * A font "según el equipo" has no file a web page can embed: the direct PDF draws it in the nearest
   * PDF standard font. Its label, so the interface can say so; `null` for bundled fonts.
   */
  const systemFont = computed(() => {
    const option = FONT_OPTIONS.find((font) => font.value === cv.data.style.fontFamily)
    return option && !option.bundled ? option.label : null
  })

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

  return { busy, failed, systemFont, run }
}
