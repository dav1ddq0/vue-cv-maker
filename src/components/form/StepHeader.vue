<script setup lang="ts">
/** Phone replacement for the tab strip: where you are, how far along, and a way to jump (spec 013). */
import { ref } from 'vue'
import { useUiStore } from '@/stores/ui'
import { useI18n } from '@/i18n'
import StepSheet from './StepSheet.vue'

const ui = useUiStore()
const { t } = useI18n()
const open = ref(false)
</script>

<template>
  <div class="header">
    <h2 class="heading">
      <button type="button" class="trigger" aria-haspopup="dialog" @click="open = true">
        <span class="top">
          <span class="position">{{ t('stepSheet.position', { n: ui.stepIndex + 1, total: ui.steps.length }) }}</span>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
        </span>
        <span class="name">{{ t(`steps.${ui.step}`) }}</span>
        <span class="segments" aria-hidden="true">
          <span v-for="(id, index) in ui.steps" :key="id" class="segment" :class="{ 'segment--on': index <= ui.stepIndex }" />
        </span>
        <span class="sr-only">{{ t('stepSheet.open') }}</span>
      </button>
    </h2>
    <StepSheet :open="open" @close="open = false" />
  </div>
</template>

<style scoped>
.heading {
  margin: 0;
  font-size: inherit;
}

.trigger {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  width: 100%;
  min-height: 56px;
  padding: 0.7em 1em 0.8em;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--surface);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--text-muted);
}

.position {
  font-size: 0.8em;
  font-weight: 500;
}

.name {
  font-size: 1.2em;
  font-weight: 700;
  margin-top: -0.2em;
}

.segments {
  display: grid;
  grid-template-columns: repeat(v-bind('ui.steps.length'), minmax(0, 1fr));
  gap: 4px;
}

.segment {
  height: 6px;
  border-radius: 3px;
  background: var(--border);
}

.segment--on {
  background: var(--accent);
}
</style>
