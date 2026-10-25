<script setup lang="ts">
/** Free navigation: any step is reachable at any time (spec §5). */
import { onMounted, ref, useId, watch } from 'vue'
import { useUiStore } from '@/stores/ui'
import { useCvStore } from '@/stores/cv'
import { useI18n } from '@/i18n'

const ui = useUiStore()
const cv = useCvStore()
const { t } = useI18n()

const nav = ref<HTMLElement | null>(null)
const strip = ref<HTMLElement | null>(null)
const labelId = useId()

/**
 * The tab strip scrolls horizontally, so "Next" can move the active step out of sight.
 * Scrolls the strip itself rather than scrollIntoView, which would also move ancestors.
 */
function revealActive() {
  const tab = nav.value?.querySelector<HTMLElement>('[aria-current="step"]')
  const el = strip.value
  if (!tab || !el) return
  const right = tab.offsetLeft + tab.offsetWidth
  if (tab.offsetLeft < el.scrollLeft) el.scrollLeft = tab.offsetLeft
  else if (right > el.scrollLeft + el.clientWidth) el.scrollLeft = right - el.clientWidth
}

watch(() => ui.step, revealActive, { flush: 'post' })
onMounted(revealActive)
</script>

<template>
  <nav ref="nav" class="wizard-nav" :aria-label="t('nav.editor')">
    <ol ref="strip" class="steps">
      <li v-for="(id, index) in ui.steps" :key="id">
        <button
          type="button"
          class="step"
          :class="{ 'step--active': ui.step === id }"
          :aria-current="ui.step === id ? 'step' : undefined"
          @click="ui.goTo(id)"
        >
          <span class="index">{{ index + 1 }}</span>
          <span class="label">{{ t(`steps.${id}`) }}</span>
        </button>
      </li>
    </ol>

    <div class="progress">
      <div class="track">
        <div
          class="bar"
          :style="{ width: `${(cv.filledSections / cv.totalSections) * 100}%` }"
          role="progressbar"
          :aria-valuenow="cv.filledSections"
          :aria-valuemin="0"
          :aria-valuemax="cv.totalSections"
          :aria-labelledby="labelId"
        />
      </div>
      <p :id="labelId" class="progress-label">
        {{ t('progress', { done: cv.filledSections, total: cv.totalSections }) }}
      </p>
    </div>
  </nav>
</template>

<style scoped>
.wizard-nav {
  display: flex;
  flex-direction: column;
  gap: 0.8em;
}

.steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 0.3em;
  overflow-x: auto;
  scrollbar-width: thin;
  position: relative; /* offsetParent for revealActive() */
}

.step {
  display: flex;
  align-items: center;
  gap: 0.4em;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 999px;
  padding: 0.3em 0.7em;
  color: var(--text-muted);
  white-space: nowrap;
  font-size: 0.86em;
}

.step:hover {
  background: var(--surface-2);
  color: var(--text);
}

.step--active {
  background: var(--accent-soft);
  border-color: var(--accent);
  color: var(--text);
  font-weight: 600;
}

.index {
  display: inline-grid;
  place-items: center;
  width: 1.5em;
  height: 1.5em;
  border-radius: 50%;
  background: var(--surface-2);
  font-size: 0.85em;
}

.step--active .index {
  background: var(--accent);
  color: var(--on-accent);
}

.track {
  height: 4px;
  background: var(--surface-2);
  border-radius: 999px;
}

.bar {
  height: 100%;
  background: var(--accent);
  border-radius: 999px;
  transition: width 0.2s ease;
}

.progress-label {
  margin: 0.5em 0 0;
  font-size: 0.78em;
  color: var(--text-muted);
}

@media (max-height: 500px) and (orientation: landscape) {
  .progress {
    display: none;
  }
}

@media (pointer: coarse) {
  .step {
    min-height: 44px;
  }
}
</style>
