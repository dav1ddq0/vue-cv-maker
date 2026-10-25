<script setup lang="ts">
/**
 * Bottom dock for narrow screens (specs 013, 016): Edit / Preview switch and one main action, in a
 * single row where the thumb is. It lives outside the form on purpose: in preview mode the form is
 * hidden, and a toggle inside it left no way back. Back / previous step live in the step bar.
 */
import { computed, ref } from 'vue'
import { useUiStore } from '@/stores/ui'
import { useI18n } from '@/i18n'
import ExportSheet from './ExportSheet.vue'

const ui = useUiStore()
const { t } = useI18n()
const exportOpen = ref(false)

const isLast = computed(() => ui.stepIndex === ui.steps.length - 1)
</script>

<template>
  <div class="dock">
    <div class="switch" role="group" :aria-label="t('dock.label')">
      <button type="button" class="mode" :aria-label="t('dock.edit')" :aria-pressed="!ui.previewOpen" @click="ui.previewOpen = false">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z" /></svg>
        <span class="mode-label">{{ t('dock.edit') }}</span>
      </button>
      <button type="button" class="mode" :aria-label="t('preview.title')" :aria-pressed="ui.previewOpen" @click="ui.previewOpen = true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
        <span class="mode-label">{{ t('preview.title') }}</span>
      </button>
    </div>

    <template v-if="ui.previewOpen">
      <button type="button" class="action" aria-haspopup="dialog" @click="exportOpen = true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v12m0 0l-4-4m4 4l4-4" /><path d="M4 20h16" /></svg>
        {{ t('steps.export') }}
      </button>
      <ExportSheet :open="exportOpen" @close="exportOpen = false" />
    </template>
    <button v-else type="button" class="action" :disabled="isLast" @click="ui.nextStep()">
      {{ t('actions.next') }}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
    </button>
  </div>
</template>

<style scoped>
.dock {
  display: none;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.6em;
  padding: 0.5em 0.75em calc(0.75em + var(--safe-bottom));
  border-top: 1px solid var(--border);
  background: var(--surface);
}

@media (max-width: 640px) {
  .dock {
    display: grid;
  }
}

.switch {
  display: flex;
  gap: 3px;
  padding: 3px;
  border-radius: 14px;
  background: var(--surface-2);
}

.mode {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4em;
  flex: 0 0 44px;
  min-height: 44px;
  padding: 0 0.7em;
  border: 0;
  border-radius: 11px;
  white-space: nowrap;
  background: transparent;
  color: var(--text-muted);
  font: inherit;
  font-size: 0.9em;
  font-weight: 600;
  cursor: pointer;
}

/* The unselected side shrinks to its icon: both labels do not fit in half of a 320px screen. */
.mode-label {
  display: none;
}

.mode[aria-pressed='true'] {
  flex: 0 0 auto;
  background: var(--surface);
  color: var(--text);
  box-shadow: var(--shadow);
}

.mode[aria-pressed='true'] .mode-label {
  display: inline;
}

.action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4em;
  min-height: 50px;
  border: 0;
  border-radius: 14px;
  background: var(--accent);
  color: var(--on-accent);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.action:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
