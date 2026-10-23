import { describe, expect, it } from 'vitest'
import { History } from '@/core/history'

describe('History', () => {
  it('walks back and forward through snapshots', () => {
    const history = new History<string>(10)
    history.push('a')
    history.push('b')

    expect(history.undo('c')).toBe('b')
    expect(history.undo('b')).toBe('a')
    expect(history.canUndo).toBe(false)
    expect(history.redo('a')).toBe('b')
  })

  it('discards the redo branch once a new edit lands', () => {
    const history = new History<string>(10)
    history.push('a')
    history.undo('b')
    history.push('c')

    expect(history.canRedo).toBe(false)
  })

  it('drops the oldest snapshot past the limit', () => {
    const history = new History<number>(2)
    history.push(1)
    history.push(2)
    history.push(3)

    expect(history.undo(4)).toBe(3)
    expect(history.undo(3)).toBe(2)
    expect(history.canUndo).toBe(false)
  })
})
