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
    <button type="button" class="arrow" :aria-label="t('stepSheet.prev')" :disabled="ui.stepIndex === 0" @click="ui.prevStep()">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
    </button>

    <h2 class="heading">
      <button type="button" class="trigger" aria-haspopup="dialog" @click="open = true">
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
      class="arrow"
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
  grid-template-columns: 44px minmax(0, 1fr) 44px;
  align-items: center;
  min-height: 60px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface);
}

.heading {
  margin: 0;
  font-size: inherit;
  min-width: 0;
}

.arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  border: 0;
  background: transparent;
  color: var(--text);
  cursor: pointer;
}

.arrow:disabled {
  color: var(--text-muted);
  opacity: 0.5;
  cursor: default;
}

.trigger {
  display: flex;
  flex-direction: column;
  gap: 0.4em;
  width: 100%;
  min-height: 44px;
  padding: 0.4em 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.line {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5em;
}

.name {
  min-width: 0;
  overflow: hidden;
  font-size: 1.05em;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.position {
  flex-shrink: 0;
  font-size: 0.8em;
  color: var(--text-muted);
}

.segments {
  display: grid;
  grid-template-columns: repeat(v-bind('ui.steps.length'), minmax(0, 1fr));
  gap: 3px;
}

.segment {
  height: 4px;
  border-radius: 2px;
  background: var(--border);
}

.segment--on {
  background: var(--accent);
}
</style>
