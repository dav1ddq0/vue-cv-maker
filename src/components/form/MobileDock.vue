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
      <button type="button" class="mode m3-state" :aria-label="t('dock.edit')" :aria-pressed="!ui.previewOpen" @click="ui.setPreviewOpen(false)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z" /></svg>
        <span class="mode-label">{{ t('dock.edit') }}</span>
      </button>
      <button type="button" class="mode m3-state" :aria-label="t('preview.title')" :aria-pressed="ui.previewOpen" @click="ui.setPreviewOpen(true)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
        <span class="mode-label">{{ t('preview.title') }}</span>
      </button>
    </div>

    <!-- On the last step there is nothing next: the main action is exporting (spec 027). -->
    <template v-if="ui.previewOpen || isLast">
      <button type="button" class="action m3-state" aria-haspopup="dialog" @click="exportOpen = true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v12m0 0l-4-4m4 4l4-4" /><path d="M4 20h16" /></svg>
        {{ t('steps.export') }}
      </button>
      <ExportSheet :open="exportOpen" @close="exportOpen = false" />
    </template>
    <button v-else type="button" class="action m3-state" @click="ui.nextStep()">
      {{ t('actions.next') }}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
    </button>
  </div>
</template>

<style scoped>
/* M3 bottom app bar (spec 029): surface-container, an edit/preview toggle, the extended FAB. */
.dock {
  display: none;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  min-height: 80px;
  padding: 12px 16px calc(12px + var(--safe-bottom));
  background: var(--md-surface-container);
}

@media (max-width: 640px) {
  .dock {
    display: grid;
  }
}

.switch {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: var(--shape-full);
  background: var(--md-surface-container-highest);
}

.mode {
  --container: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 0 0 48px;
  min-height: 48px;
  padding: 0 12px;
  border: 0;
  border-radius: var(--shape-full);
  white-space: nowrap;
  color: var(--md-on-surface-variant);
  font: var(--type-label-large);
  letter-spacing: var(--tracking-label-large);
  cursor: pointer;
}

/* The unselected side shrinks to its icon: both labels do not fit in half of a 320px screen. */
.mode-label {
  display: none;
}

.mode[aria-pressed='true'] {
  --container: var(--md-secondary-container);
  flex: 0 0 auto;
  padding: 0 16px;
  color: var(--md-on-secondary-container);
}

.mode[aria-pressed='true'] .mode-label {
  display: inline;
}

/* Extended FAB: 56 dp, large shape, primary container; no shadow while it sits in the bar. */
.action {
  --container: var(--md-primary-container);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 56px;
  padding: 0 20px;
  border: 0;
  border-radius: var(--shape-lg);
  color: var(--md-on-primary-container);
  font: var(--type-label-large);
  letter-spacing: var(--tracking-label-large);
  cursor: pointer;
}

.action:disabled {
  --container: color-mix(in srgb, var(--md-on-surface) 12%, transparent);
  color: color-mix(in srgb, var(--md-on-surface) 38%, transparent);
  cursor: default;
}
</style>
