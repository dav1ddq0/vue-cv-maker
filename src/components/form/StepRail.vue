<script setup lang="ts">
/** Desktop step list (spec 018): every step with its state, overall progress and the storage note. */
import { computed } from 'vue'
import { useUiStore } from '@/stores/ui'
import { useCvStore } from '@/stores/cv'
import { useI18n } from '@/i18n'
import { stepStatus } from '@/core/stepStatus'
import { useStepDetail } from '@/composables/useStepDetail'
import { useCvExport } from '@/composables/useCvExport'

const ui = useUiStore()
const cv = useCvStore()
const { t } = useI18n()
const { detail, badge } = useStepDetail()
const { busy, run } = useCvExport()

/** Export holds no data, so it never counts towards progress. */
const counted = computed(() => ui.steps.filter((id) => id !== 'export'))
const done = computed(() => counted.value.filter((id) => stepStatus(cv.data, id).state === 'complete').length)
</script>

<template>
  <nav class="rail" :aria-label="t('rail.label')">
    <div class="progress">
      <span class="progress-line">
        <span class="progress-title">{{ t('rail.progress') }}</span>
        {{ t('rail.done', { done, total: counted.length }) }}
      </span>
      <span class="track" aria-hidden="true">
        <span class="bar" :style="{ width: `${(done / counted.length) * 100}%` }" />
      </span>
    </div>

    <ol class="list">
      <li v-for="(id, index) in ui.steps" :key="id">
        <button
          type="button"
          class="row m3-state"
          :class="{ 'row--current': id === ui.step }"
          :aria-current="id === ui.step ? 'step' : undefined"
          @click="ui.goTo(id)"
        >
          <span class="badge" :class="`badge--${badge(id)}`">
            <svg v-if="badge(id) === 'complete'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10" /></svg>
            <template v-else>{{ index + 1 }}</template>
          </span>
          <span class="text">
            <span class="name">{{ t(`steps.${id}`) }}</span>
            <span v-if="detail(id)" class="detail" :class="{ 'detail--warn': badge(id) === 'incomplete' }">{{ detail(id) }}</span>
          </span>
        </button>
      </li>
    </ol>

    <button type="button" class="add m3-state" @click="ui.goTo('custom')">+ {{ t('rail.addSection') }}</button>
    <p class="note">
      {{ t('rail.storage') }}
      <button type="button" class="link" :disabled="busy !== null" @click="run('json')">{{ t('rail.backup') }}</button>
    </p>
  </nav>
</template>

<style scoped>
.rail {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 0;
  padding: 16px 12px;
  overflow: auto;
  background: var(--md-surface-container-low);
}

.progress {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 0 0.5em 0.8em;
}

.progress-line {
  display: flex;
  justify-content: space-between;
  font: var(--type-label-medium);
  letter-spacing: var(--tracking-label);
  color: var(--md-on-surface-variant);
}

.progress-title {
  color: var(--md-on-surface);
}

.track {
  display: block;
  height: 4px;
  border-radius: var(--shape-full);
  background: var(--md-secondary-container);
}

.bar {
  display: block;
  height: 100%;
  border-radius: var(--shape-full);
  background: var(--md-primary);
  transition: width var(--duration-medium) var(--motion-standard);
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
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
  width: 26px;
  height: 26px;
  box-sizing: border-box;
  border: 2px solid var(--md-outline);
  border-radius: 50%;
  font-size: 0.75em;
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
  overflow: hidden;
  font: var(--type-body-small);
  letter-spacing: var(--tracking-body-small);
  color: var(--md-on-surface-variant);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row--current .detail {
  color: var(--md-on-secondary-container);
}

.detail--warn {
  color: var(--md-warning);
}

.add {
  margin: 0.8em 0.25em 0;
  min-height: 40px;
  --container: transparent;
  border: 1px dashed var(--md-outline);
  border-radius: var(--shape-full);
  color: var(--md-primary);
  font: inherit;
  font-size: 0.85em;
  font-weight: 600;
  cursor: pointer;
}

.note {
  margin: 0.8em 0.5em 0;
  font-size: 0.75em;
  line-height: 1.45;
  color: var(--text-muted);
}

.link {
  padding: 0;
  border: 0;
  background: none;
  color: var(--accent-text, var(--accent));
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}
</style>
