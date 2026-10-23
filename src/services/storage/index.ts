import { IndexedDBAdapter } from './indexeddb'
import type { StorageAdapter } from './adapter'

export * from './adapter'
export {
  savePhoto,
  loadPhoto,
  deletePhoto,
  requestPersistence,
  isStorageAvailable,
} from './indexeddb'

/** Single app-wide adapter. Swapping this line is the whole Phase 6 frontend change. */
export const storage: StorageAdapter = new IndexedDBAdapter()
