// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { breakParts } from '@/templates/shared'

vi.mock('@/services/export', () => ({ sideColumnOverflows: vi.fn() }))

import { sideColumnOverflows } from '@/services/export'
import { useSideColumnFit } from '@/composables/useSideColumnFit'
import { useCvStore } from '@/stores/cv'

describe('breakParts (spec 033)', () => {
  it('lets an e-mail wrap after the @ and before dots', () => {
    expect(breakParts('carmen.ortega@example.com')).toEqual(['carmen', '.ortega@', 'example', '.com'])
  })

  it('lets a URL wrap before its slashes, keeping "://" whole', () => {
    expect(breakParts('https://ana.dev/cv?x=1')).toEqual(['https://ana', '.dev', '/cv', '?x', '=1'])
  })

  it('leaves text without those characters whole', () => {
    expect(breakParts('+34 600 123 456')).toEqual(['+34 600 123 456'])
    expect(breakParts('Valencia, España')).toEqual(['Valencia, España'])
  })
})

describe('useSideColumnFit (spec 033)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })
  afterEach(() => vi.useRealTimers())

  it('measures after edits settle and keeps only the latest answer', async () => {
    const answers: ((v: boolean) => void)[] = []
    vi.mocked(sideColumnOverflows).mockImplementation(() => new Promise((resolve) => answers.push(resolve)))
    const scope = effectScope()
    const { overflows } = scope.run(() => useSideColumnFit())!
    await vi.advanceTimersByTimeAsync(600)
    expect(answers).toHaveLength(1)

    useCvStore().data.skills = []
    await nextTick()
    await vi.advanceTimersByTimeAsync(600)
    expect(answers).toHaveLength(2)
    answers[1]!(true)
    await Promise.resolve()
    answers[0]!(false)
    await Promise.resolve()
    expect(overflows.value).toBe(true)
    scope.stop()
  })
})
