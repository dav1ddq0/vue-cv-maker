<script setup lang="ts">
/** Every export in one phone sheet: the dock has room for a single Export button (specs 013, 016). */
import { useI18n } from '@/i18n'
import { useCvExport, type ExportKind } from '@/composables/useCvExport'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import { useCvStore } from '@/stores/cv'
import { printTitle } from '@/services/export'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const { t } = useI18n()
const cv = useCvStore()
const { busy, run } = useCvExport()

const OPTIONS: { kind: ExportKind; title: string; hint: string }[] = [
  { kind: 'pdf', title: 'exportView.pdf', hint: 'exportView.pdfHint' },
  { kind: 'html', title: 'exportView.html', hint: 'exportView.htmlHint' },
  { kind: 'json', title: 'exportView.json', hint: 'exportView.jsonHint' },
]

async function pick(kind: ExportKind) {
  await run(kind)
  emit('close')
}
</script>

<template>
  <BottomSheet :open="open" :title="t('exportView.title')" @close="emit('close')">
    <ul class="list">
      <li v-for="option in OPTIONS" :key="option.kind">
        <button type="button" class="row" :disabled="busy !== null" @click="pick(option.kind)">
          <span class="text">
            <span class="name">{{ t(option.title) }}</span>
            <span class="hint">{{ t(option.hint) }}</span>
            <span v-if="option.kind === 'pdf'" class="hint">{{ t('exportDialog.printNote', { file: printTitle(cv.data) }) }}</span>
          </span>
          <span class="action">{{ busy === option.kind ? t('exportView.preparing') : t(option.kind === 'pdf' ? 'exportView.printShort' : 'exportView.download') }}</span>
        </button>
      </li>
    </ul>
  </BottomSheet>
</template>

<style scoped>
.list {
  list-style: none;
  margin: 0;
  padding: 0 0 calc(1em + var(--safe-bottom));
  display: flex;
  flex-direction: column;
  gap: 0.6em;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1em;
  width: 100%;
  min-height: 64px;
  padding: 0.7em 1em;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--surface);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.row:disabled {
  opacity: 0.6;
  cursor: default;
}

.text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.name {
  font-weight: 600;
}

.hint {
  font-size: 0.85em;
  color: var(--text-muted);
}

.action {
  flex-shrink: 0;
  font-weight: 600;
  color: var(--accent);
}
</style>
