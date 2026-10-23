<script setup lang="ts">
/** Jump to any step from a bottom sheet, with the state of each (phones, spec 013). */
import { useUiStore, type StepId } from '@/stores/ui'
import { useCvStore } from '@/stores/cv'
import { useI18n } from '@/i18n'
import { stepStatus } from '@/core/stepStatus'
import BottomSheet from '@/components/ui/BottomSheet.vue'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const ui = useUiStore()
const cv = useCvStore()
const { t } = useI18n()

/** Steps whose count says something useful ("3"); for the others it would be noise. */
const COUNTED: StepId[] = ['experience', 'education', 'skills', 'languages', 'custom']

function detail(id: StepId): string {
  if (id === ui.step) return t('stepSheet.here')
  const { state, count } = stepStatus(cv.data, id)
  if (state === 'complete') {
    return count > 0 && COUNTED.includes(id) ? t('stepSheet.completeCount', { n: count }) : t('stepSheet.complete')
  }
  if (state === 'incomplete') return t('stepSheet.incomplete')
  if (state === 'optional') return t('stepSheet.optional')
  return ''
}

function go(id: StepId) {
  ui.goTo(id)
  emit('close')
}
</script>

<template>
  <BottomSheet :open="open" :title="t('stepSheet.title')" @close="emit('close')">
    <ol class="list">
      <li v-for="(id, index) in ui.steps" :key="id">
        <button
          type="button"
          class="row"
          :class="{ 'row--current': id === ui.step }"
          :aria-current="id === ui.step ? 'step' : undefined"
          @click="go(id)"
        >
          <span class="badge" :class="`badge--${id === ui.step ? 'current' : stepStatus(cv.data, id).state}`">
            <svg v-if="id !== ui.step && stepStatus(cv.data, id).state === 'complete'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10" /></svg>
            <template v-else>{{ index + 1 }}</template>
          </span>
          <span class="text">
            <span class="name">{{ t(`steps.${id}`) }}</span>
            <span v-if="detail(id)" class="detail">{{ detail(id) }}</span>
          </span>
        </button>
      </li>
    </ol>
  </BottomSheet>
</template>

<style scoped>
.list {
  list-style: none;
  margin: 0;
  padding: 0 0 calc(1em + var(--safe-bottom));
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.row {
  display: flex;
  align-items: center;
  gap: 0.9em;
  width: 100%;
  min-height: 56px;
  padding: 0 0.8em;
  border: 0;
  border-radius: 14px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.row--current {
  background: var(--accent-soft);
}

.badge {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--border);
  font-size: 0.9em;
  font-weight: 700;
  color: var(--text-muted);
}

.badge--current {
  border-color: var(--accent);
  background: var(--accent);
  color: var(--on-accent);
}

.badge--complete {
  border-color: transparent;
  background: color-mix(in srgb, #15803d 16%, var(--surface));
  color: #15803d;
}

.badge--incomplete {
  border-color: #b45309;
  color: #92400e;
}

:root[data-theme='dark'] .badge--complete {
  color: #6ee7a0;
}

:root[data-theme='dark'] .badge--incomplete {
  border-color: #f0c36d;
  color: #f0c36d;
}

.text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.name {
  font-weight: 600;
}

.detail {
  font-size: 0.85em;
  color: var(--text-muted);
}
</style>
