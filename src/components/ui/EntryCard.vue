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
      class="summary m3-state"
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
  gap: 8px;
}

.summary {
  --container: transparent;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 48px;
  padding: 4px 8px;
  border: 0;
  border-radius: var(--shape-md);
  color: var(--md-on-surface);
  font: inherit;
  text-align: left;
  cursor: pointer;
}


.text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1.4px;
  min-width: 0;
}

.title {
  overflow: hidden;
  font: var(--type-title-medium);
  letter-spacing: var(--tracking-title-medium);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subtitle {
  font: var(--type-body-medium);
  letter-spacing: var(--tracking-body-medium);
  color: var(--md-on-surface-variant);
}

.chevron {
  flex-shrink: 0;
  transition: transform var(--duration-short) var(--motion-standard);
}

.chevron--open {
  transform: rotate(180deg);
}

.body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
