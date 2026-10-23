import { createStore, del, get, set } from 'idb-keyval'
import type { CVData, CVSummary } from '@/types/cv'
import { migrate } from '@/core/migrations'
import { NotFoundError, StorageQuotaError, type StorageAdapter } from './adapter'

const store = createStore('cv-maker', 'kv')

const cvKey = (id: string) => `cv:${id}`
export const photoKey = (id: string) => `photo:${id}`
const INDEX_KEY = 'index'

/**
 * Key scheme (spec §8.1):
 *   `cv:{id}`    full CVData (photos excluded — only the reference is stored)
 *   `photo:{id}` the image as a Blob (~33% smaller than a base64 dataURL)
 *   `index`      CVSummary[] so the CV list renders without loading every document
 */
export class IndexedDBAdapter implements StorageAdapter {
  async list(): Promise<CVSummary[]> {
    const index = (await get<CVSummary[]>(INDEX_KEY, store)) ?? []
    return [...index].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  async load(id: string): Promise<CVData> {
    const raw = await get<CVData>(cvKey(id), store)
    if (!raw) throw new NotFoundError(id)
    return migrate(raw)
  }

  async save(data: CVData): Promise<void> {
    try {
      await set(cvKey(data.meta.id), structuredClone(data), store)
      await this.updateIndex(data)
    } catch (error) {
      throw isQuotaError(error) ? new StorageQuotaError(error) : error
    }
  }

  async delete(id: string): Promise<void> {
    const data = await get<CVData>(cvKey(id), store)
    if (data?.personal.photo) await del(data.personal.photo, store).catch(() => {})
    await del(cvKey(id), store)
    const index = (await get<CVSummary[]>(INDEX_KEY, store)) ?? []
    await set(INDEX_KEY, index.filter((s) => s.id !== id), store)
  }

  private async updateIndex(data: CVData) {
    const index = (await get<CVSummary[]>(INDEX_KEY, store)) ?? []
    const summary: CVSummary = {
      id: data.meta.id,
      title: data.meta.title,
      fullName: data.personal.fullName,
      updatedAt: data.meta.updatedAt,
    }
    const at = index.findIndex((s) => s.id === summary.id)
    if (at >= 0) index[at] = summary
    else index.push(summary)
    await set(INDEX_KEY, index, store)
  }
}

/* ---- photo blobs ------------------------------------------------------- */

export async function savePhoto(cvId: string, blob: Blob): Promise<string> {
  const key = photoKey(cvId)
  try {
    await set(key, blob, store)
  } catch (error) {
    throw isQuotaError(error) ? new StorageQuotaError(error) : error
  }
  return key
}

export async function loadPhoto(key: string): Promise<Blob | undefined> {
  return get<Blob>(key, store)
}

export async function deletePhoto(key: string): Promise<void> {
  await del(key, store)
}

/* ---- environment probes ------------------------------------------------ */

/**
 * Asks the browser to keep our data through storage pressure. Silently ignored
 * on browsers without the API; a `false` result is worth surfacing to the user.
 */
export async function requestPersistence(): Promise<boolean> {
  if (!navigator.storage?.persist) return false
  try {
    if (await navigator.storage.persisted()) return true
    return await navigator.storage.persist()
  } catch {
    return false
  }
}

/**
 * Private browsing does not reliably expose itself, but it does reliably fail to
 * *store* things. Probing with a real write is the only portable detection.
 */
export async function isStorageAvailable(): Promise<boolean> {
  try {
    await set('__probe__', 1, store)
    await del('__probe__', store)
    return true
  } catch {
    return false
  }
}

function isQuotaError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  )
}
