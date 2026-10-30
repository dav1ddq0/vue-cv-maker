// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const storage = vi.hoisted(() => ({ available: true, persist: () => Promise.resolve(true) as Promise<boolean> }))

vi.mock('@/services/storage', () => ({
  isStorageAvailable: () => Promise.resolve(storage.available),
  requestPersistence: () => storage.persist(),
}))

const { useUiStore } = await import('@/stores/ui')

describe('probeEnvironment (spec 052)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    storage.available = true
    storage.persist = () => Promise.resolve(true)
  })

  it('does not wait for a persistence answer that needs the person to click (Firefox)', async () => {
    storage.persist = () => new Promise(() => {})
    const ui = useUiStore()
    await expect(ui.probeEnvironment()).resolves.toBeUndefined()
    expect(ui.storageAvailable).toBe(true)
  })

  it('records the answer when it comes, and a refusal shows the notice', async () => {
    let answer!: (persisted: boolean) => void
    storage.persist = () => new Promise<boolean>((resolve) => (answer = resolve))
    const ui = useUiStore()
    await ui.probeEnvironment()
    expect(ui.storagePersisted).toBe(true)
    answer(false)
    await vi.waitFor(() => expect(ui.storagePersisted).toBe(false))
  })

  it('says storage is neither available nor persistent when it cannot store', async () => {
    storage.available = false
    const ui = useUiStore()
    await ui.probeEnvironment()
    expect(ui.storageAvailable).toBe(false)
    expect(ui.storagePersisted).toBe(false)
  })
})
