import type { CVData } from '@/types/cv'

/**
 * - `complete`: has what the step is for.
 * - `incomplete`: a core step that is still empty.
 * - `optional`: may stay empty without hurting the CV.
 * - `none`: the step holds no data (export).
 */
export type StepState = 'complete' | 'incomplete' | 'optional' | 'none'

export interface StepStatus {
  state: StepState
  /** Entries in the step (characters for the summary); 0 when empty. Lets the UI say "3 jobs". */
  count: number
}

const filled = (value: string | undefined | null) => (value ?? '').trim().length > 0

const byCount = (count: number, whenEmpty: StepState): StepStatus => ({
  state: count > 0 ? 'complete' : whenEmpty,
  count,
})

/**
 * Derived from the data, never stored, and advisory like the rest of validation (spec §5): an
 * incomplete step never blocks navigation. `id` is any step id; unknown ids report `none`.
 */
export function stepStatus(data: CVData, id: string): StepStatus {
  switch (id) {
    case 'personal': {
      const { fullName, email } = data.personal
      return { state: filled(fullName) && filled(email) ? 'complete' : 'incomplete', count: 0 }
    }
    case 'summary':
      return byCount(data.summary.trim().length, 'incomplete')
    case 'experience':
      return byCount(data.experience.length, 'incomplete')
    case 'education':
      return byCount(data.education.length, 'incomplete')
    case 'skills':
      return byCount(
        data.skills.reduce((total, group) => total + group.items.length, 0),
        'incomplete',
      )
    case 'languages':
      return byCount(data.languages.length, 'optional')
    case 'custom':
      return byCount(data.customSections.length, 'optional')
    case 'style':
      return { state: 'complete', count: 0 }
    default:
      return { state: 'none', count: 0 }
  }
}
