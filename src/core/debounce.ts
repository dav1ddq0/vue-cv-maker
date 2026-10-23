export interface Debounced<A extends unknown[]> {
  (...args: A): void
  /** Runs a pending call right now — used before navigating away or exporting. */
  flush(): void
  cancel(): void
}

export function debounce<A extends unknown[]>(fn: (...args: A) => void, wait: number): Debounced<A> {
  let timer: ReturnType<typeof setTimeout> | undefined
  let pending: A | undefined

  const debounced = ((...args: A) => {
    pending = args
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = undefined
      const call = pending
      pending = undefined
      if (call) fn(...call)
    }, wait)
  }) as Debounced<A>

  debounced.flush = () => {
    if (!timer) return
    clearTimeout(timer)
    timer = undefined
    const call = pending
    pending = undefined
    if (call) fn(...call)
  }

  debounced.cancel = () => {
    if (timer) clearTimeout(timer)
    timer = undefined
    pending = undefined
  }

  return debounced
}
