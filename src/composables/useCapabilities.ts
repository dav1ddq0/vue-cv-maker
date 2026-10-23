import { computed } from 'vue'
import type { TemplateCapability } from '@/types/template'
import { getTemplate } from '@/templates/registry'
import { useUiStore } from '@/stores/ui'
import { useI18n } from '@/i18n'

/**
 * Uneven capabilities (spec §4): when the active template does not declare a
 * capability the related data is *ignored, never deleted*. Controls are dimmed
 * with a quiet explanation, and switching back restores everything.
 */
export function useCapabilities() {
  const ui = useUiStore()
  const { t } = useI18n()

  const template = computed(() => getTemplate(ui.templateId))

  const supports = (capability: TemplateCapability) =>
    computed(() => template.value.supports.includes(capability))

  const reasonFor = (capability: TemplateCapability) =>
    computed(() =>
      template.value.supports.includes(capability)
        ? undefined
        : t('style.unsupported', { capability: t(`style.capability.${capability}`) }),
    )

  return { template, supports, reasonFor }
}
