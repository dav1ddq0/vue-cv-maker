<script setup lang="ts">
/** Duplicate / delete a CV from a bottom sheet; deleting asks for confirmation inside it. */
import { ref, watch } from 'vue'
import { useI18n } from '@/i18n'
import type { CVSummary } from '@/types/cv'
import BottomSheet from '@/components/ui/BottomSheet.vue'

const props = defineProps<{ open: boolean; doc: CVSummary | null }>()
const emit = defineEmits<{ close: []; duplicate: [id: string]; remove: [id: string] }>()
const { t } = useI18n()

const confirming = ref(false)
watch(() => props.open, () => (confirming.value = false))
</script>

<template>
  <BottomSheet :open="open" :title="doc?.fullName || doc?.title || t('documents.untitled')" @close="emit('close')">
    <div v-if="doc" class="actions">
      <template v-if="!confirming">
        <button type="button" class="row" @click="emit('duplicate', doc.id)">{{ t('actions.duplicate') }}</button>
        <button type="button" class="row row--danger" @click="confirming = true">{{ t('actions.remove') }}</button>
      </template>
      <template v-else>
        <p class="confirm">{{ t('documents.deleteConfirm', { title: doc.title }) }}</p>
        <div class="pair">
          <button type="button" class="row" @click="confirming = false">{{ t('actions.cancel') }}</button>
          <button type="button" class="row row--solid" @click="emit('remove', doc.id)">{{ t('actions.confirm') }}</button>
        </div>
      </template>
    </div>
  </BottomSheet>
</template>

<style scoped>
.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 4px calc(16px + var(--safe-bottom));
}

.confirm {
  margin: 2px 4px;
  color: var(--text-muted);
}

.pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.row {
  min-height: 56px;
  border: 1px solid var(--border);
  border-radius: var(--shape-lg);
  background: var(--surface);
  color: inherit;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.row--danger {
  color: var(--danger);
}

.row--solid {
  border-color: var(--md-error);
  background: var(--md-error);
  color: var(--md-on-error);
}
</style>
