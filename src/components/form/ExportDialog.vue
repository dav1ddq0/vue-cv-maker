<script setup lang="ts">
/**
 * Desktop export (spec 018): pick a format, see what is still missing, run it. A modal native
 * <dialog>: focus trap, Esc and focus return come free, as in BottomSheet.
 */
import { computed, ref, useId, watch } from 'vue'
import { useUiStore, type StepId } from '@/stores/ui'
import { useCvStore } from '@/stores/cv'
import { useI18n } from '@/i18n'
import { stepStatus } from '@/core/stepStatus'
import { useCvExport, type ExportKind } from '@/composables/useCvExport'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const ui = useUiStore()
const cv = useCvStore()
const { t } = useI18n()
const { busy, run } = useCvExport()

const dialog = ref<HTMLDialogElement | null>(null)
const titleId = useId()
const kind = ref<ExportKind>('pdf')

watch(
  () => props.open,
  (open) => {
    const el = dialog.value
    if (!el) return
    if (open && !el.open) el.showModal()
    else if (!open && el.open) el.close()
  },
  { flush: 'post' },
)

const FORMATS: { kind: ExportKind; title: string; hint: string }[] = [
  { kind: 'pdf', title: 'exportView.pdf', hint: 'exportView.pdfHint' },
  { kind: 'html', title: 'exportView.html', hint: 'exportView.htmlHint' },
  { kind: 'json', title: 'exportView.json', hint: 'exportView.jsonHint' },
]

/** Core steps still empty; advisory, never blocking (spec §5). */
const missing = computed(() => ui.steps.filter((id) => stepStatus(cv.data, id).state === 'incomplete'))

const action = computed(() =>
  kind.value === 'pdf'
    ? t('exportView.print')
    : kind.value === 'html'
      ? t('exportDialog.downloadHtml')
      : t('exportDialog.downloadJson'),
)

function goFix(id: StepId) {
  ui.goTo(id)
  dialog.value?.close()
}

async function confirm() {
  // The print dialog must not open on top of a modal that is still showing.
  dialog.value?.close()
  await run(kind.value)
}
</script>

<template>
  <dialog ref="dialog" class="export" :aria-labelledby="titleId" @close="emit('close')">
    <header class="head">
      <h2 :id="titleId" class="title">{{ t('exportView.title') }}</h2>
      <button type="button" class="close" :aria-label="t('actions.close')" @click="dialog?.close()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </header>

    <div class="formats" role="radiogroup" :aria-labelledby="titleId">
      <label v-for="format in FORMATS" :key="format.kind" class="format" :class="{ 'format--on': kind === format.kind }">
        <input v-model="kind" type="radio" name="export-kind" :value="format.kind" />
        <span class="format-text">
          <span class="format-title">
            {{ t(format.title) }}
            <span v-if="format.kind === 'pdf'" class="badge">{{ t('exportDialog.recommended') }}</span>
          </span>
          <span class="format-hint">{{ t(format.hint) }}</span>
        </span>
      </label>
    </div>
    <p v-if="kind === 'pdf'" class="note">{{ t('exportDialog.printNote') }}</p>

    <section class="check" :aria-label="t('exportDialog.checkTitle')">
      <h3 class="check-title">{{ t('exportDialog.checkTitle') }}</h3>
      <p v-if="!missing.length" class="ok">{{ t('exportDialog.allGood') }}</p>
      <ul v-else class="missing">
        <li v-for="id in missing" :key="id">
          <button type="button" class="fix" @click="goFix(id)">{{ t('exportDialog.missing', { step: t(`steps.${id}`) }) }}</button>
        </li>
      </ul>
    </section>

    <footer class="foot">
      <button type="button" class="secondary" @click="dialog?.close()">{{ t('actions.cancel') }}</button>
      <button type="button" class="primary" :disabled="busy !== null" @click="confirm">
        {{ busy ? t('exportView.preparing') : action }}
      </button>
    </footer>
  </dialog>
</template>

<style scoped>
.export {
  width: min(560px, calc(100vw - 32px));
  padding: 1.4em 1.5em;
  border: 0;
  border-radius: 16px;
  background: var(--surface);
  color: var(--text);
  box-shadow: 0 24px 64px rgba(15, 23, 42, 0.28);
}

.export[open] {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.export::backdrop {
  background: rgba(15, 23, 42, 0.45);
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  margin: 0;
  font-size: 1.25em;
  font-weight: 700;
}

.close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.formats {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.format {
  display: flex;
  align-items: center;
  gap: 0.9em;
  padding: 0.85em 1em;
  border: 1px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
}

.format--on {
  border-color: var(--accent);
  box-shadow: inset 0 0 0 1px var(--accent);
}

.format input {
  width: 18px;
  height: 18px;
  margin: 0;
  accent-color: var(--accent);
}

.format-text {
  display: flex;
  flex-direction: column;
  gap: 0.15em;
}

.format-title {
  font-weight: 600;
}

.format-hint,
.note {
  font-size: 0.85em;
  color: var(--text-muted);
}

.note {
  margin: -0.4em 0 0;
}

.badge {
  margin-left: 0.4em;
  padding: 0.1em 0.55em;
  border-radius: 10px;
  background: color-mix(in srgb, #15803d 16%, var(--surface));
  color: #166534;
  font-size: 0.72em;
  font-weight: 700;
}

:root[data-theme='dark'] .badge {
  color: #6ee7a0;
}

.check {
  padding: 0.9em 1em;
  border-radius: 12px;
  background: var(--surface-2);
}

.check-title {
  margin: 0 0 0.4em;
  font-size: 0.85em;
  font-weight: 700;
}

.ok {
  margin: 0;
  font-size: 0.85em;
}

.missing {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2em;
}

.fix {
  padding: 0.2em 0;
  border: 0;
  background: none;
  color: #92400e;
  font: inherit;
  font-size: 0.85em;
  text-decoration: underline;
  cursor: pointer;
}

:root[data-theme='dark'] .fix {
  color: #f0c36d;
}

.foot {
  display: flex;
  justify-content: flex-end;
  gap: 0.6em;
}

.secondary,
.primary {
  min-height: 42px;
  padding: 0 1.1em;
  border-radius: 10px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.secondary {
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
}

.primary {
  border: 0;
  background: var(--accent);
  color: var(--on-accent);
}

.primary:disabled {
  opacity: 0.6;
  cursor: default;
}
</style>
