import { get, setMany, type UseStore } from 'idb-keyval'

/** The database the app used while it was called "CV Maker" (spec 039). */
const LEGACY_DB = 'cv-maker'
const LEGACY_STORE = 'kv'

/**
 * The legacy database, or null when this browser never had one (it is not left behind empty) or it
 * cannot be opened: that holds nothing readable here, and it must not keep the app from starting.
 */
function openLegacy(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    let request: IDBOpenDBRequest
    try {
      request = indexedDB.open(LEGACY_DB)
    } catch {
      return resolve(null)
    }
    let created = false
    request.onupgradeneeded = () => {
      created = true
    }
    request.onsuccess = () => {
      const db = request.result
      if (!created && db.objectStoreNames.contains(LEGACY_STORE)) return resolve(db)
      db.close()
      if (created) indexedDB.deleteDatabase(LEGACY_DB)
      resolve(null)
    }
    request.onerror = () => resolve(null)
  })
}

function readAll(db: IDBDatabase): Promise<[IDBValidKey, unknown][]> {
  return new Promise((resolve, reject) => {
    const objects = db.transaction(LEGACY_STORE).objectStore(LEGACY_STORE)
    const keys = objects.getAllKeys()
    const values = objects.getAll()
    values.onsuccess = () => resolve(keys.result.map((key, i) => [key, values.result[i]]))
    values.onerror = () => reject(values.error)
  })
}

/**
 * Copies the documents and photos of the "CV Maker" database into `target`, once (spec 039). It runs
 * before the first read, so `target` is still empty: it has the CV index only after a copy or after
 * the app has been used under its new name. One transaction writes everything or nothing; the legacy
 * database is left as it was, a backup that the browser's site data can clear.
 */
export async function copyLegacyStore(target: UseStore, indexKey: string): Promise<void> {
  if (await get(indexKey, target)) return
  const legacy = await openLegacy()
  if (!legacy) return
  try {
    const entries = await readAll(legacy)
    if (entries.length) await setMany(entries, target)
  } finally {
    legacy.close()
  }
}
