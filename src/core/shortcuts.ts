/**
 * The editor's keyboard shortcuts as a pure decision (spec 035), so they can be tested without the
 * DOM: what a keydown should do given where focus is and what is open.
 */
export type ShortcutAction = 'undo' | 'redo' | 'collapsePreview' | null

export interface ShortcutKey {
  key: string
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
}

export interface ShortcutContext {
  /** The desktop preview takes the whole editor (spec 030). */
  previewExpanded: boolean
  /** A modal dialog is open: Esc belongs to it. */
  dialogOpen: boolean
  /** Focus is in a text field: Ctrl+Z belongs to the field's own undo. */
  inTextField: boolean
}

export function shortcutFor(event: ShortcutKey, context: ShortcutContext): ShortcutAction {
  if (event.key === 'Escape') return context.previewExpanded && !context.dialogOpen ? 'collapsePreview' : null
  const mod = event.ctrlKey || event.metaKey
  if (!mod || event.key.toLowerCase() !== 'z' || context.inTextField) return null
  return event.shiftKey ? 'redo' : 'undo'
}
