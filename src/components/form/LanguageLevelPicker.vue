<script setup lang="ts">
/**
 * One-click CEFR levels for a language (spec 019). It only writes text into the same free field the
 * user can still type in, so "Bilingual" or "Fluent" keep working and templates read what they read.
 */
import { computed } from 'vue'

const props = defineProps<{ modelValue: string; cvLanguage: string; label: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

/** "Native" is CV content, so it follows the CV language, not the interface. */
const NATIVE: Record<string, string> = { es: 'Nativo', en: 'Native' }
const levels = computed(() => ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', NATIVE[props.cvLanguage] ?? NATIVE.en!])

const isCurrent = (level: string) => props.modelValue.trim().toLowerCase() === level.toLowerCase()
</script>

<template>
  <div class="picker" role="group" :aria-label="label">
    <button
      v-for="level in levels"
      :key="level"
      type="button"
      class="level"
      :aria-pressed="isCurrent(level)"
      @click="emit('update:modelValue', level)"
    >
      {{ level }}
    </button>
  </div>
</template>

<style scoped>
.picker {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 3px;
  border-radius: 9px;
  background: var(--surface-2);
}

.level {
  flex: 1 1 auto;
  min-width: 34px;
  min-height: 30px;
  padding: 0 0.5em;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--text);
  font: inherit;
  font-size: 0.8em;
  font-weight: 600;
  cursor: pointer;
}

.level[aria-pressed='true'] {
  background: var(--accent);
  color: var(--on-accent);
}

@media (pointer: coarse) {
  .level {
    min-height: 44px;
  }
}
</style>
