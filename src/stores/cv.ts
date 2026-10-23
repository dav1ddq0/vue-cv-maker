import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { CVData, CVSummary } from '@/types/cv'
import { SECTION_IDS } from '@/types/cv'
import { createEmptyCV } from '@/core/factory'
import { uid } from '@/core/id'
import { History } from '@/core/history'
import { debounce } from '@/core/debounce'
import { migrate, reconcileOrder } from '@/core/migrations'
import { NotFoundError, storage, StorageQuotaError } from '@/services/storage'
import { readPrefs, writePrefs } from '@/services/prefs'

const AUTOSAVE_MS = 500
/** Edits closer together than this collapse into a single undo step. */
const HISTORY_COALESCE_MS = 600

export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export const useCvStore = defineStore('cv', () => {
  const data = ref<CVData>(createEmptyCV())
  const documents = ref<CVSummary[]>([])
  const saveState = ref<SaveState>('idle')
  const saveError = ref<string | null>(null)

  const history = new History<string>(30)
  const canUndo = ref(false)
  const canRedo = ref(false)
  /** Suppresses history + autosave while we are the ones rewriting `data`. */
  let suspended = false
  let lastCommitted = snapshot()

  /**
   * Applies a mutation the user did not make.
   *
   * The deep watcher below reacts to any change inside `data`, so writing to it
   * from our own code would look exactly like an edit. `suspended` is cleared in
   * a microtask queued *after* the watcher's own job, so the watcher sees the
   * flag and skips, then normal tracking resumes.
   */
  function withoutTracking(mutate: () => void) {
    suspended = true
    mutate()
    queueMicrotask(() => {
      suspended = false
    })
  }

  /* ---- persistence ----------------------------------------------------- */

  const persist = debounce(async () => {
    saveState.value = 'saving'
    try {
      // The timestamp is stamped on the outgoing copy, never on `data` itself:
      // writing it back into the watched object would retrigger this watcher,
      // which would in turn reset the history timer on every autosave and leave
      // the undo stack permanently empty.
      const stamp = new Date().toISOString()
      const payload = toPlain(data.value)
      payload.meta.updatedAt = stamp
      await storage.save(payload)
      withoutTracking(() => {
        data.value.meta.updatedAt = stamp
      })
      saveState.value = 'saved'
      saveError.value = null
      await refreshDocuments()
    } catch (error) {
      saveState.value = 'error'
      saveError.value = error instanceof StorageQuotaError ? 'quota' : 'unknown'
    }
  }, AUTOSAVE_MS)

  const commitHistory = debounce(() => {
    const next = snapshot()
    if (next === lastCommitted) return
    history.push(lastCommitted)
    lastCommitted = next
    syncHistoryFlags()
  }, HISTORY_COALESCE_MS)

  watch(
    data,
    () => {
      if (suspended) return
      commitHistory()
      persist()
    },
    { deep: true },
  )

  /** Forces any pending autosave/history write to land — call before export or unload. */
  async function flush() {
    commitHistory.flush()
    persist.flush()
    await Promise.resolve()
  }

  /* ---- document lifecycle ---------------------------------------------- */

  async function refreshDocuments() {
    documents.value = await storage.list()
  }

  async function init() {
    await refreshDocuments()
    const lastId = readPrefs().lastCvId
    const target = lastId && documents.value.some((d) => d.id === lastId) ? lastId : documents.value[0]?.id
    if (target) await open(target)
    else await createNew({ persistNow: false })
  }

  async function open(id: string) {
    try {
      replaceData(await storage.load(id))
      writePrefs({ lastCvId: id })
    } catch (error) {
      if (!(error instanceof NotFoundError)) throw error
      await createNew()
    }
  }

  async function createNew(options: { persistNow?: boolean; seed?: Partial<CVData> } = {}) {
    const { persistNow = true, seed } = options
    replaceData(createEmptyCV(seed))
    writePrefs({ lastCvId: data.value.meta.id })
    if (persistNow) {
      persist()
      persist.flush()
    }
  }

  async function duplicate(id: string) {
    const source = await storage.load(id)
    const copy = structuredClone(source)
    copy.meta = {
      ...copy.meta,
      id: createEmptyCV().meta.id,
      title: `${copy.meta.title} (2)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    // The photo blob stays under the original key; a duplicate referencing it
    // would lose its picture when the original is deleted.
    delete copy.personal.photo
    await storage.save(copy)
    await refreshDocuments()
    return copy.meta.id
  }

  async function remove(id: string) {
    await storage.delete(id)
    await refreshDocuments()
    if (data.value.meta.id !== id) return
    const next = documents.value[0]?.id
    if (next) await open(next)
    else await createNew({ persistNow: false })
  }

  /** Replaces the whole document without polluting the undo stack of the old one. */
  function replaceData(next: CVData) {
    persist.cancel()
    commitHistory.cancel()
    withoutTracking(() => {
      data.value = next
    })
    history.clear()
    lastCommitted = snapshot()
    syncHistoryFlags()
    saveState.value = 'idle'
    saveError.value = null
  }

  /**
   * Brings imported data in, either as a new document or over the open one.
   *
   * "New" issues a fresh id so importing the same file twice never silently
   * overwrites an earlier import; "current" keeps the open document's identity
   * so the CV list entry and its photo reference stay valid.
   */
  async function importData(incoming: CVData, mode: 'new' | 'current') {
    const merged = migrate(incoming)
    merged.sectionOrder = reconcileOrder(merged.sectionOrder, merged)
    const now = new Date().toISOString()

    if (mode === 'new') {
      merged.meta = { ...merged.meta, id: uid('cv'), createdAt: now, updatedAt: now }
      replaceData(merged)
      writePrefs({ lastCvId: merged.meta.id })
      persist()
      persist.flush()
      return
    }

    merged.meta = {
      ...merged.meta,
      id: data.value.meta.id,
      createdAt: data.value.meta.createdAt,
      updatedAt: now,
    }
    commitHistory.flush()
    data.value = merged
  }

  /* ---- undo / redo ----------------------------------------------------- */

  function undo() {
    commitHistory.flush()
    const previous = history.undo(snapshot())
    if (previous === undefined) return
    restore(previous)
  }

  function redo() {
    const next = history.redo(snapshot())
    if (next === undefined) return
    restore(next)
  }

  function restore(json: string) {
    withoutTracking(() => {
      data.value = JSON.parse(json) as CVData
    })
    lastCommitted = json
    syncHistoryFlags()
    // The restored state still has to reach storage, but as our write, not as
    // a user edit: scheduling it directly keeps it out of the history.
    persist()
  }

  function snapshot(): string {
    return JSON.stringify(toPlain(data.value))
  }

  function syncHistoryFlags() {
    canUndo.value = history.canUndo
    canRedo.value = history.canRedo
  }

  /* ---- derived --------------------------------------------------------- */

  const filledSections = computed(() => {
    const d = data.value
    return [
      Boolean(d.personal.fullName.trim()),
      Boolean(d.summary.trim()),
      d.experience.length > 0,
      d.education.length > 0,
      d.skills.length > 0,
      d.languages.length > 0,
    ].filter(Boolean).length
  })

  const totalSections = SECTION_IDS.length + 1

  return {
    data,
    documents,
    saveState,
    saveError,
    canUndo,
    canRedo,
    filledSections,
    totalSections,
    init,
    open,
    createNew,
    duplicate,
    remove,
    refreshDocuments,
    importData,
    replaceData,
    undo,
    redo,
    flush,
  }
})

/** Strips Vue proxies so the value is safe for `structuredClone` and IndexedDB. */
function toPlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}
