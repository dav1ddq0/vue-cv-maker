import type { CVData, CVSummary } from '@/types/cv'

/**
 * The only contract the rest of the app knows about. `IndexedDBAdapter` implements
 * it today; a `RemoteAdapter` (Phase 6) can replace it without any caller changing.
 */
export interface StorageAdapter {
  list(): Promise<CVSummary[]>
  load(id: string): Promise<CVData>
  save(data: CVData): Promise<void>
  delete(id: string): Promise<void>
}

export class StorageQuotaError extends Error {
  constructor(cause?: unknown) {
    super('Storage quota exceeded')
    this.name = 'StorageQuotaError'
    this.cause = cause
  }
}

export class NotFoundError extends Error {
  constructor(id: string) {
    super(`CV not found: ${id}`)
    this.name = 'NotFoundError'
  }
}
