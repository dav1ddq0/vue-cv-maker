import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { CVData, CVSummary } from '@/types/cv'

/**
 * The store is tested against an in-memory adapter: these tests are about
 * history and autosave coordination, not about IndexedDB.
 */
const saved = new Map<string, CVData>()

vi.mock('@/services/storage', () => ({
  storage: {
    list: async (): Promise<CVSummary[]> => [],
    load: async (id: string) => saved.get(id)!,
    save: async (data: CVData) => void saved.set(data.meta.id, structuredClone(data)),
    delete: async (id: string) => void saved.delete(id),
  },
  NotFoundError: class NotFoundError extends Error {},
  StorageQuotaError: class StorageQuotaError extends Error {},
}))

/** This file runs without a DOM, so preferences live in memory too. */
let prefs: Record<string, unknown> = {}
vi.mock('@/services/prefs', () => ({
  readPrefs: () => ({ lastTemplateId: 'classic', lastCvId: null, ...prefs }),
  writePrefs: (patch: Record<string, unknown>) => void (prefs = { ...prefs, ...patch }),
}))

const { useCvStore } = await import('@/stores/cv')

/** Lets pending watchers and awaited microtasks settle. */
const settle = async () => {
  for (let i = 0; i < 5; i++) await Promise.resolve()
}

/** Simulates a pause long enough to close an undo step and fire an autosave. */
async function idle(ms: number) {
  await vi.advanceTimersByTimeAsync(ms)
  await settle()
}

describe('cv store history', () => {
  beforeEach(() => {
    saved.clear()
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  it('records one undo step per editing burst', async () => {
    const cv = useCvStore()

    cv.data.personal.fullName = 'Ada'
    await idle(1500)
    cv.data.personal.email = 'ada@example.com'
    await idle(1500)
    cv.data.summary = 'Resumen'
    await idle(1500)

    expect(cv.canUndo).toBe(true)

    cv.undo()
    await settle()
    expect(cv.data.summary).toBe('')
    expect(cv.data.personal.email).toBe('ada@example.com')

    cv.undo()
    await settle()
    expect(cv.data.personal.email).toBe('')
    expect(cv.data.personal.fullName).toBe('Ada')
  })

  it('undoes a change of the CV language like any other edit', async () => {
    const cv = useCvStore()
    expect(cv.data.meta.language).toBe('es')

    cv.data.meta.language = 'en'
    await idle(1500)
    expect(cv.canUndo).toBe(true)

    cv.undo()
    await settle()
    expect(cv.data.meta.language).toBe('es')

    cv.redo()
    await settle()
    expect(cv.data.meta.language).toBe('en')
  })

  it('enables the undo button as soon as a step is recorded', async () => {
    const cv = useCvStore()
    expect(cv.canUndo).toBe(false)

    cv.data.personal.fullName = 'Ada'
    await idle(1500)

    expect(cv.canUndo).toBe(true)
  })

  it('keeps more than 20 steps of history', async () => {
    const cv = useCvStore()

    for (let i = 0; i < 25; i++) {
      cv.data.summary = `version ${i}`
      await idle(1500)
    }

    let steps = 0
    while (cv.canUndo && steps < 40) {
      cv.undo()
      await settle()
      steps++
    }

    expect(steps).toBeGreaterThanOrEqual(20)
  })

  it('does nothing when undoing past the first recorded state', async () => {
    const cv = useCvStore()
    cv.data.personal.fullName = 'Ada'
    await idle(1500)

    cv.undo()
    await settle()
    const atBase = JSON.stringify(cv.data)

    cv.undo()
    cv.undo()
    await settle()

    expect(JSON.stringify(cv.data)).toBe(atBase)
    // Undoing past the base must not destroy the redo stack.
    expect(cv.canRedo).toBe(true)

    cv.redo()
    await settle()
    expect(cv.data.personal.fullName).toBe('Ada')
  })

  it('autosaves without re-triggering itself', async () => {
    const cv = useCvStore()
    cv.data.personal.fullName = 'Ada'
    await idle(1500)

    const writes = saved.size
    const stamp = saved.get(cv.data.meta.id)?.meta.updatedAt

    // With no further edits, idling must not produce another write.
    await idle(5000)

    expect(saved.size).toBe(writes)
    expect(saved.get(cv.data.meta.id)?.meta.updatedAt).toBe(stamp)
  })
})

describe('per-CV template (spec 021)', () => {
  beforeEach(() => {
    saved.clear()
    prefs = {}
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  it('stores the pick in the open CV, autosaves it and undoes it like any edit', async () => {
    const cv = useCvStore()
    expect(cv.templateId).toBe('classic')

    cv.setTemplate('meridian')
    await idle(1500)
    expect(saved.get(cv.data.meta.id)?.meta.templateId).toBe('meridian')

    cv.undo()
    await settle()
    expect(cv.templateId).toBe('classic')
  })

  it('switches to the template of the CV being opened', async () => {
    const cv = useCvStore()
    cv.setTemplate('meridian')
    await idle(1500)
    const first = cv.data.meta.id

    await cv.createNew()
    cv.setTemplate('aurora')
    await idle(1500)
    expect(cv.templateId).toBe('aurora')

    await cv.open(first)
    expect(cv.templateId).toBe('meridian')
  })

  it('starts a new CV in the last template picked, and a duplicate in its source template', async () => {
    const cv = useCvStore()
    cv.setTemplate('meridian')
    await idle(1500)
    const source = cv.data.meta.id

    await cv.createNew()
    expect(cv.templateId).toBe('meridian')

    const copy = await cv.duplicate(source)
    expect(saved.get(copy)?.meta.templateId).toBe('meridian')
  })
})
