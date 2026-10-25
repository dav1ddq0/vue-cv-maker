import { useUiStore, type StepId } from '@/stores/ui'
import { useCvStore } from '@/stores/cv'
import { useI18n } from '@/i18n'
import { stepStatus } from '@/core/stepStatus'
import { suggest } from '@/core/suggestions'

/** Steps whose count says something useful ("3"); for the others it would be noise. */
const COUNTED: StepId[] = ['experience', 'education', 'skills', 'languages', 'custom']

/**
 * The one-line state shown under each step name ("Complete · 3", "Missing content", "You are here").
 * Shared by the phone step sheet and the desktop step rail (specs 013, 018).
 */
export function useStepDetail() {
  const ui = useUiStore()
  const cv = useCvStore()
  const { t } = useI18n()

  function detail(id: StepId): string {
    if (id === ui.step) return t('stepSheet.here')
    // Export holds no data; its line points at the CV review instead (spec 023).
    if (id === 'export') {
      const n = suggest(cv.data).length
      return n === 0 ? '' : n === 1 ? t('review.countOne') : t('review.count', { n })
    }
    const { state, count } = stepStatus(cv.data, id)
    if (state === 'complete') {
      return count > 0 && COUNTED.includes(id) ? t('stepSheet.completeCount', { n: count }) : t('stepSheet.complete')
    }
    if (state === 'incomplete') return t('stepSheet.incomplete')
    if (state === 'optional') return t('stepSheet.optional')
    return ''
  }

  /** Badge state: the current step wins over its data state. */
  function badge(id: StepId): 'current' | ReturnType<typeof stepStatus>['state'] {
    return id === ui.step ? 'current' : stepStatus(cv.data, id).state
  }

  return { detail, badge }
}
