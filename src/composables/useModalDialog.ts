import { onMounted, watch, type Ref } from 'vue'

/**
 * Keeps a native modal `<dialog>` open exactly while `open()` is true (spec 028): `showModal()` gives
 * the focus trap, Esc, top layer and focus return. Closing from inside (Esc, a form button) still
 * fires the dialog's own `close` event, which the component handles.
 *
 * Synced after render, and once on mount: an immediate watcher would run before the element exists.
 */
export function useModalDialog(dialog: Readonly<Ref<HTMLDialogElement | null>>, open: () => boolean) {
  function sync() {
    const el = dialog.value
    if (!el) return
    if (open() && !el.open) el.showModal()
    else if (!open() && el.open) el.close()
  }

  watch(open, sync, { flush: 'post' })
  onMounted(sync)
}
