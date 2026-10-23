<script setup lang="ts">
/**
 * Skill names with an optional 1–5 level each. Replaces the chip input where a
 * per-item level is needed; adding works the same way (Enter or comma).
 */
import { ref } from 'vue'
import type { SkillItem } from '@/types/cv'
import { useI18n } from '@/i18n'

const props = defineProps<{ modelValue: SkillItem[]; id?: string; levelsDisabled?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: SkillItem[]] }>()
const { t } = useI18n()

const draft = ref('')

function commit() {
  const names = draft.value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
  if (names.length) emit('update:modelValue', [...props.modelValue, ...names.map((name) => ({ name }))])
  draft.value = ''
}

function update(index: number, patch: Partial<SkillItem>) {
  emit(
    'update:modelValue',
    props.modelValue.map((item, i) => {
      if (i !== index) return item
      const next = { ...item, ...patch }
      if (next.level === undefined) delete next.level
      return next
    }),
  )
}

function setLevel(index: number, value: string) {
  update(index, { level: value ? Number(value) : undefined })
}

function remove(index: number) {
  emit('update:modelValue', props.modelValue.filter((_, i) => i !== index))
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault()
    commit()
  }
}
</script>

<template>
  <div class="items">
    <div v-for="(item, index) in modelValue" :key="index" class="row">
      <input
        class="name"
        :value="item.name"
        :aria-label="t('skills.itemName')"
        @input="update(index, { name: ($event.target as HTMLInputElement).value })"
      />
      <select
        class="level"
        :value="item.level ?? ''"
        :disabled="levelsDisabled"
        :aria-label="`${t('skills.level')}: ${item.name}`"
        @change="setLevel(index, ($event.target as HTMLSelectElement).value)"
      >
        <option value="">{{ t('skills.noLevel') }}</option>
        <option v-for="n in 5" :key="n" :value="n">{{ n }} / 5</option>
      </select>
      <button type="button" class="remove" :aria-label="t('skills.removeItem', { name: item.name })" @click="remove(index)">
        ✕
      </button>
    </div>

    <input
      :id="id"
      v-model="draft"
      class="add"
      :placeholder="t('skills.addItem')"
      @keydown="onKeydown"
      @blur="commit"
    />
  </div>
</template>

<style scoped>
.items {
  display: flex;
  flex-direction: column;
  gap: 0.4em;
}

.row {
  display: grid;
  grid-template-columns: 1fr 7.5em auto;
  gap: 0.4em;
  align-items: center;
}

.remove {
  padding: 0.3em 0.55em;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text-muted);
}

.remove:hover {
  color: var(--danger, currentColor);
}
</style>
