<script setup lang="ts">
/** Free navigation: any step is reachable at any time (spec §5). */
import { onMounted, useId, useTemplateRef, watch } from 'vue'
import { useUiStore } from '@/stores/ui'
import { useCvStore } from '@/stores/cv'
import { useI18n } from '@/i18n'

const ui = useUiStore()
const cv = useCvStore()
const { t } = useI18n()

const nav = useTemplateRef<HTMLElement>('nav')
const strip = useTemplateRef<HTMLElement>('strip')
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
          class="step m3-state"
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
  --container: transparent;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 16px 0 8px;
  border: 0;
  border-radius: var(--shape-full);
  color: var(--md-on-surface-variant);
  white-space: nowrap;
  font: var(--type-label-large);
  letter-spacing: var(--tracking-label-large);
}

.step--active {
  --container: var(--md-secondary-container);
  color: var(--md-on-secondary-container);
}

.index {
  display: inline-grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--md-surface-container-highest);
  font: var(--type-label-medium);
}

.step--active .index {
  background: var(--md-primary);
  color: var(--md-on-primary);
}

.track {
  height: 4px;
  background: var(--md-secondary-container);
  border-radius: var(--shape-full);
}

.bar {
  height: 100%;
  background: var(--md-primary);
  border-radius: var(--shape-full);
  transition: width var(--duration-medium) var(--motion-standard);
}

.progress-label {
  margin: 8px 0 0;
  font: var(--type-body-small);
  letter-spacing: var(--tracking-body-small);
  color: var(--md-on-surface-variant);
}

@media (max-height: 500px) and (orientation: landscape) {
  .progress {
    display: none;
  }
}

</style>
