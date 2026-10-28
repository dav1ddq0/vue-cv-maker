<script setup lang="ts">
/** Jump to any step from a bottom sheet, with the state of each (phones, spec 013). */
import { useUiStore, type StepId } from '@/stores/ui'
import { useI18n } from '@/i18n'
import { useStepDetail } from '@/composables/useStepDetail'
import BottomSheet from '@/components/ui/BottomSheet.vue'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const ui = useUiStore()
const { t } = useI18n()
const { detail, badge } = useStepDetail()

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
          class="row m3-state"
          :class="{ 'row--current': id === ui.step }"
          :aria-current="id === ui.step ? 'step' : undefined"
          @click="go(id)"
        >
          <span class="badge" :class="`badge--${badge(id)}`">
            <svg v-if="badge(id) === 'complete'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10" /></svg>
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
  --container: transparent;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 56px;
  padding: 0 16px 0 12px;
  border: 0;
  border-radius: var(--shape-full);
  color: var(--md-on-surface-variant);
  font: var(--type-label-large);
  letter-spacing: var(--tracking-label-large);
  text-align: left;
  cursor: pointer;
}

.row--current {
  --container: var(--md-secondary-container);
  color: var(--md-on-secondary-container);
}

.badge {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--md-outline);
  font-size: 0.9em;
  font-weight: 700;
  color: var(--text-muted);
}

.badge--current {
  border-color: var(--md-primary);
  background: var(--md-primary);
  color: var(--md-on-primary);
}

.badge--complete {
  border-color: transparent;
  background: var(--md-success-container);
  color: var(--md-on-success-container);
}

.badge--incomplete {
  border-color: var(--md-warning);
  color: var(--md-warning);
}

.text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.name {
  font: var(--type-title-small);
  letter-spacing: var(--tracking-title-small);
}

.detail {
  font: var(--type-body-small);
  letter-spacing: var(--tracking-body-small);
  color: var(--md-on-surface-variant);
}
</style>
