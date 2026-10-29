<script setup lang="ts">
/** Phone replacement for the tab strip: where you are, how far along, previous / next, and a way to jump (specs 013, 016). */
import { computed, ref } from 'vue'
import { useUiStore } from '@/stores/ui'
import { useI18n } from '@/i18n'
import StepSheet from './StepSheet.vue'

const ui = useUiStore()
const { t } = useI18n()
const open = ref(false)

const nextName = computed(() => {
  const id = ui.steps[ui.stepIndex + 1]
  return id ? t(`steps.${id}`) : ''
})
</script>

<template>
  <div class="header">
    <button type="button" class="arrow m3-icon-btn m3-state" :aria-label="t('stepSheet.prev')" :disabled="ui.stepIndex === 0" @click="ui.prevStep()">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
    </button>

    <h2 class="heading">
      <button type="button" class="trigger m3-state" aria-haspopup="dialog" @click="open = true">
        <span class="line">
          <span class="name">{{ t(`steps.${ui.step}`) }}</span>
          <span class="position">{{ t('stepSheet.short', { n: ui.stepIndex + 1, total: ui.steps.length }) }}</span>
        </span>
        <span class="segments" aria-hidden="true">
          <span v-for="(id, index) in ui.steps" :key="id" class="segment" :class="{ 'segment--on': index <= ui.stepIndex }" />
        </span>
        <span class="sr-only">{{ t('stepSheet.position', { n: ui.stepIndex + 1, total: ui.steps.length }) }} · {{ t('stepSheet.open') }}</span>
      </button>
    </h2>

    <button
      type="button"
      class="arrow m3-icon-btn m3-state"
      :aria-label="nextName ? t('stepSheet.next', { step: nextName }) : t('actions.next')"
      :disabled="ui.stepIndex === ui.steps.length - 1"
      @click="ui.nextStep()"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
    </button>
    <StepSheet :open="open" @close="open = false" />
  </div>
</template>

<style scoped>
.header {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) 48px;
  align-items: center;
  gap: 4px;
  min-height: 64px;
  padding: 0 4px;
  border-radius: var(--shape-lg);
  background: var(--md-surface-container-high);
}

.heading {
  margin: 0;
  font-size: inherit;
  min-width: 0;
}

.arrow {
  width: 48px;
  height: 48px;
  color: var(--md-on-surface);
}

.trigger {
  --container: transparent;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  min-height: 48px;
  padding: 8px;
  border: 0;
  border-radius: var(--shape-md);
  color: var(--md-on-surface);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.line {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.name {
  min-width: 0;
  overflow: hidden;
  font: var(--type-title-medium);
  letter-spacing: var(--tracking-title-medium);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.position {
  flex-shrink: 0;
  font: var(--type-label-medium);
  letter-spacing: var(--tracking-label);
  color: var(--md-on-surface-variant);
}

.segments {
  display: grid;
  grid-template-columns: repeat(v-bind('ui.steps.length'), minmax(0, 1fr));
  gap: 4px;
}

.segment {
  height: 4px;
  border-radius: var(--shape-full);
  background: var(--md-secondary-container);
}

.segment--on {
  background: var(--md-primary);
}
</style>
