<script setup lang="ts">
/** A list entry that folds to a one-line summary (spec 018). The parent owns which one is open. */
import { useId } from 'vue'
import { useI18n } from '@/i18n'

defineProps<{ title: string; subtitle: string; open: boolean }>()
const emit = defineEmits<{ toggle: [] }>()
const { t } = useI18n()
const bodyId = useId()
</script>

<template>
  <div class="entry-card">
    <button
      type="button"
      class="summary"
      :aria-expanded="open"
      :aria-controls="bodyId"
      :aria-label="t(open ? 'entry.collapse' : 'entry.expand', { title })"
      @click="emit('toggle')"
    >
      <span class="text">
        <span class="title">{{ title }}</span>
        <span v-if="subtitle" class="subtitle">{{ subtitle }}</span>
      </span>
      <svg class="chevron" :class="{ 'chevron--open': open }" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
    </button>
    <div v-show="open" :id="bodyId" class="body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.entry-card {
  display: flex;
  flex-direction: column;
  gap: 0.7em;
}

.summary {
  display: flex;
  align-items: center;
  gap: 0.75em;
  width: 100%;
  min-height: 44px;
  padding: 0.2em 0.25em;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.summary:hover {
  background: var(--surface-2);
}

.text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.1em;
  min-width: 0;
}

.title {
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subtitle {
  font-size: 0.85em;
  color: var(--text-muted);
}

.chevron {
  flex-shrink: 0;
  transition: transform 0.15s ease;
}

.chevron--open {
  transform: rotate(180deg);
}

.body {
  display: flex;
  flex-direction: column;
  gap: 0.7em;
}
</style>
