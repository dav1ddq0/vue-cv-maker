import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { readPrefs, writePrefs } from '@/services/prefs'
import { isStorageAvailable, requestPersistence } from '@/services/storage'
import { DARK_QUERY, resolveTheme, systemPrefersDark, type ThemeChoice } from '@/core/theme'

export const STEPS = [
  'personal',
  'summary',
  'experience',
  'education',
  'skills',
  'languages',
  'custom',
  'style',
  'export',
] as const

export type StepId = (typeof STEPS)[number]
export type View = 'editor' | 'documents' | 'import' | 'welcome'

export const useUiStore = defineStore('ui', () => {
  const prefs = readPrefs()

  const view = ref<View>('editor')
  const step = ref<StepId>('personal')
  const templateId = ref(prefs.lastTemplateId)
  const theme = ref<ThemeChoice>(prefs.theme)
  /** Live OS preference; only matters while the choice is `system`. */
  const systemDark = ref(systemPrefersDark())
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    window.matchMedia(DARK_QUERY).addEventListener('change', (event) => {
      systemDark.value = event.matches
      if (theme.value === 'system') applyTheme()
    })
  }
  const resolvedTheme = computed(() => resolveTheme(theme.value, systemDark.value))
  const previewOpen = ref(false)
  const dismissedNotices = ref<string[]>(prefs.dismissedNotices)

  /** Environment facts surfaced as notices (spec §8.2). */
  const storageAvailable = ref(true)
  const storagePersisted = ref(true)

  const stepIndex = computed(() => STEPS.indexOf(step.value))

  function goTo(next: StepId) {
    step.value = next
    view.value = 'editor'
  }

  function nextStep() {
    const at = stepIndex.value
    if (at < STEPS.length - 1) step.value = STEPS[at + 1]
  }

  function prevStep() {
    const at = stepIndex.value
    if (at > 0) step.value = STEPS[at - 1]
  }

  function setTemplate(id: string) {
    templateId.value = id
    writePrefs({ lastTemplateId: id })
  }

  function applyTheme() {
    document.documentElement.dataset.theme = resolvedTheme.value
  }

  function setTheme(next: ThemeChoice) {
    theme.value = next
    writePrefs({ theme: next })
    applyTheme()
  }

  function dismissNotice(id: string) {
    if (dismissedNotices.value.includes(id)) return
    dismissedNotices.value = [...dismissedNotices.value, id]
    writePrefs({ dismissedNotices: dismissedNotices.value })
  }

  const isDismissed = (id: string) => dismissedNotices.value.includes(id)

  async function probeEnvironment() {
    storageAvailable.value = await isStorageAvailable()
    storagePersisted.value = storageAvailable.value ? await requestPersistence() : false
  }

  return {
    view,
    step,
    stepIndex,
    steps: STEPS,
    templateId,
    theme,
    resolvedTheme,
    previewOpen,
    storageAvailable,
    storagePersisted,
    goTo,
    nextStep,
    prevStep,
    setTemplate,
    setTheme,
    dismissNotice,
    isDismissed,
    probeEnvironment,
  }
})
