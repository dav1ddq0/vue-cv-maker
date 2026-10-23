<script setup lang="ts">
/**
 * Bottom dock for narrow screens (spec 013): Edit / Preview switch and Back / Next, where the
 * thumb is. It lives outside the form on purpose: in preview mode the form is hidden, and a
 * toggle inside it left no way back.
 */
import { computed, ref } from 'vue'
import { useUiStore } from '@/stores/ui'
import { useI18n } from '@/i18n'
import { useCvExport } from '@/composables/useCvExport'
import ExportSheet from './ExportSheet.vue'

const ui = useUiStore()
const { t } = useI18n()
const { busy, run } = useCvExport()
const moreOpen = ref(false)

const isLast = computed(() => ui.stepIndex === ui.steps.length - 1)
const nextLabel = computed(() =>
  isLast.value ? t('actions.next') : t('dock.next', { step: t(`steps.${ui.steps[ui.stepIndex + 1]}`) }),
)
</script>

<template>
  <div class="dock">
    <div class="switch" role="group" :aria-label="t('dock.label')">
      <button type="button" class="mode" :aria-pressed="!ui.previewOpen" @click="ui.previewOpen = false">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z" /></svg>
        {{ t('dock.edit') }}
      </button>
      <button type="button" class="mode" :aria-pressed="ui.previewOpen" @click="ui.previewOpen = true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
        {{ t('preview.title') }}
      </button>
    </div>

    <div v-if="ui.previewOpen" class="exports">
      <button type="button" class="next" :disabled="busy !== null" @click="run('pdf')">
        {{ busy === 'pdf' ? t('exportView.preparing') : t('exportView.print') }}
      </button>
      <button type="button" class="more" :aria-label="t('dock.more')" aria-haspopup="dialog" @click="moreOpen = true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
      </button>
      <ExportSheet :open="moreOpen" @close="moreOpen = false" />
    </div>

    <div v-else class="nav">
      <button type="button" class="back" :disabled="ui.stepIndex === 0" @click="ui.prevStep()">
        {{ t('actions.back') }}
      </button>
      <button type="button" class="next" :disabled="isLast" @click="ui.nextStep()">
        {{ nextLabel }}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.dock {
  display: none;
  flex-direction: column;
  gap: 0.75em;
  padding: 0.75em 1em calc(1em + var(--safe-bottom));
  border-top: 1px solid var(--border);
  background: var(--surface);
}

@media (max-width: 1000px) {
  .dock {
    display: flex;
  }
}

.switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  padding: 4px;
  border-radius: 14px;
  background: var(--surface-2);
}

.mode {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
  min-height: 44px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--text-muted);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.mode[aria-pressed='true'] {
  background: var(--surface);
  color: var(--text);
  box-shadow: var(--shadow);
}

.nav {
  display: grid;
  grid-template-columns: minmax(84px, 112px) minmax(0, 1fr);
  gap: 0.6em;
}

.exports {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 52px;
  gap: 0.6em;
}

.more {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
}

.back,
.next {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
  min-height: 52px;
  border-radius: 14px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.back {
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
}

.next {
  border: 0;
  background: var(--accent);
  color: var(--on-accent);
}

.back:disabled,
.next:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
