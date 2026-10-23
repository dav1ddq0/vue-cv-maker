/**
 * Snapshot-based undo stack.
 *
 * Snapshots (rather than inverse commands) because every edit here is a small
 * mutation of one plain object: cloning it costs microseconds, while maintaining
 * an inverse for each of the ~40 mutations in the wizard would be a standing bug
 * source. Pushes are coalesced by the caller so a burst of keystrokes is one step.
 */
export class History<T> {
  private past: T[] = []
  private future: T[] = []

  constructor(private readonly limit = 30) {}

  push(snapshot: T): void {
    this.past.push(snapshot)
    if (this.past.length > this.limit) this.past.shift()
    this.future = []
  }

  undo(present: T): T | undefined {
    const previous = this.past.pop()
    if (previous === undefined) return undefined
    this.future.push(present)
    return previous
  }

  redo(present: T): T | undefined {
    const next = this.future.pop()
    if (next === undefined) return undefined
    this.past.push(present)
    return next
  }

  clear(): void {
    this.past = []
    this.future = []
  }

  get canUndo(): boolean {
    return this.past.length > 0
  }

  get canRedo(): boolean {
    return this.future.length > 0
  }
}
