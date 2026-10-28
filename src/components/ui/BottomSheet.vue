<script setup lang="ts">
/** Modal bottom sheet on a native <dialog>: focus trap, Esc, top layer and focus return come free. */
import { ref, useId } from 'vue'
import { useI18n } from '@/i18n'
import { useModalDialog } from '@/composables/useModalDialog'

const props = defineProps<{ open: boolean; title: string }>()
const emit = defineEmits<{ close: [] }>()

const { t } = useI18n()
const dialog = ref<HTMLDialogElement | null>(null)
const titleId = useId()

useModalDialog(dialog, () => props.open)

/**
 * `closedby="any"` handles the backdrop tap where it exists. Elsewhere (Safari) a click whose
 * target is the dialog itself and that lands outside its box is a backdrop click: the sheet has
 * no padding of its own, so inside clicks always target a child.
 */
function onBackdropClick(event: MouseEvent) {
  const el = dialog.value
  if (!el || event.target !== el || 'closedBy' in HTMLDialogElement.prototype) return
  const box = el.getBoundingClientRect()
  const inside =
    box.top <= event.clientY && event.clientY <= box.bottom &&
    box.left <= event.clientX && event.clientX <= box.right
  if (!inside) el.close()
}
</script>

<template>
  <dialog
    ref="dialog"
    class="sheet"
    closedby="any"
    :aria-labelledby="titleId"
    @close="emit('close')"
    @click="onBackdropClick"
  >
    <div class="grabber" aria-hidden="true" />
    <header class="head">
      <h2 :id="titleId" class="title">{{ title }}</h2>
      <button type="button" class="close" :aria-label="t('actions.close')" @click="dialog?.close()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </header>
    <div class="content"><slot /></div>
    <footer v-if="$slots.footer" class="foot"><slot name="footer" /></footer>
  </dialog>
</template>

<style scoped>
.sheet {
  /* Pinned to the bottom edge, full width: the thumb reaches it. */
  margin: auto 0 0;
  width: 100%;
  max-width: none;
  max-height: min(88dvh, 760px);
  padding: 0;
  border: 0;
  border-radius: 24px 24px 0 0;
  background: var(--surface);
  color: var(--text);
  overscroll-behavior: contain;
  flex-direction: column;
}

.sheet[open] {
  display: flex;
}

.sheet::backdrop {
  background: rgba(15, 23, 42, 0.5);
}

/* Keep the page still behind the sheet. */
:global(html:has(dialog.sheet[open])) {
  overflow: hidden;
}

.grabber {
  align-self: center;
  flex-shrink: 0;
  width: 40px;
  height: 5px;
  margin-top: 10px;
  border-radius: 3px;
  background: var(--border);
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 0.4em 0.5em 0.2em 1.2em;
}

.title {
  margin: 0;
  font-size: 1.2em;
  font-weight: 700;
}

.close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: 0;
  border-radius: 24px;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 0.8em;
  overscroll-behavior: contain;
}

.foot {
  flex-shrink: 0;
  padding: 0.8em 1em calc(1.2em + var(--safe-bottom));
}

/* Slide up on open; closing is instant, which also avoids the engines that cannot transition
   `display` for the top layer. */
@media (prefers-reduced-motion: no-preference) {
  .sheet[open] {
    transition: transform 0.28s ease-out;

    @starting-style {
      transform: translateY(100%);
    }
  }

  .sheet[open]::backdrop {
    transition: background-color 0.28s ease-out;

    @starting-style {
      background-color: rgba(15, 23, 42, 0);
    }
  }
}
</style>
