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
          class="row"
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

    <button type="button" class="add" @click="ui.goTo('custom')">+ {{ t('rail.addSection') }}</button>
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
  gap: 0.25em;
  min-height: 0;
  padding: 1.2em 0.75em;
  overflow: auto;
  border-right: 1px solid var(--border);
  background: var(--surface);
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
  font-size: 0.8em;
  color: var(--text-muted);
}

.progress-title {
  font-weight: 600;
  color: var(--text);
}

.track {
  display: block;
  height: 6px;
  border-radius: 3px;
  background: var(--border);
}

.bar {
  display: block;
  height: 100%;
  border-radius: 3px;
  background: var(--accent);
  transition: width 0.2s ease;
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
  display: flex;
  align-items: center;
  gap: 0.75em;
  width: 100%;
  min-height: 48px;
  padding: 0.25em 0.5em;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--text);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.row:hover {
  background: var(--surface-2);
}

.row--current,
.row--current:hover {
  background: var(--accent-soft);
}

.badge {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  box-sizing: border-box;
  border: 2px solid var(--border);
  border-radius: 50%;
  font-size: 0.75em;
  font-weight: 700;
  color: var(--text-muted);
}

.badge--current {
  border-color: var(--accent);
  background: var(--accent);
  color: var(--on-accent);
}

.badge--complete {
  border-color: transparent;
  background: color-mix(in srgb, #15803d 16%, var(--surface));
  color: #15803d;
}

.badge--incomplete {
  border-color: #b45309;
  color: #92400e;
}

:root[data-theme='dark'] .badge--complete {
  color: #6ee7a0;
}

:root[data-theme='dark'] .badge--incomplete {
  border-color: #f0c36d;
  color: #f0c36d;
}

.text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.name {
  font-size: 0.9em;
  font-weight: 600;
}

.detail {
  overflow: hidden;
  font-size: 0.75em;
  color: var(--text-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row--current .detail {
  color: var(--accent-text, var(--accent));
}

.detail--warn {
  color: #92400e;
}

:root[data-theme='dark'] .detail--warn {
  color: #f0c36d;
}

.add {
  margin: 0.8em 0.25em 0;
  min-height: 40px;
  border: 1px dashed var(--border-strong, var(--border));
  border-radius: 10px;
  background: transparent;
  color: var(--accent-text, var(--accent));
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
