<script setup lang="ts">
/**
 * Skill names with an optional 1–5 level each. Replaces the chip input where a
 * per-item level is needed; adding works the same way (Enter or comma).
 */
import { ref, shallowRef, watch } from 'vue'
import type { SkillItem } from '@/types/cv'
import { useI18n } from '@/i18n'

defineProps<{ id?: string; levelsDisabled?: boolean }>()
const items = defineModel<SkillItem[]>({ required: true })
const { t } = useI18n()

const draft = ref('')

/**
 * A key per row that follows it when a row above is removed, so focus and field state stay on the
 * row they belong to (spec 028). Items carry no id; a change of length from outside (undo, a new
 * group) starts a fresh set.
 */
let nextKey = 0
const freshKeys = (count: number) => Array.from({ length: count }, () => nextKey++)
const rowKeys = shallowRef<number[]>([])
watch(
  () => items.value.length,
  (length) => {
    if (rowKeys.value.length !== length) rowKeys.value = freshKeys(length)
  },
  { immediate: true },
)

function commit() {
  const names = draft.value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
  if (names.length) {
    rowKeys.value = [...rowKeys.value, ...freshKeys(names.length)]
    items.value = [...items.value, ...names.map((name) => ({ name }))]
  }
  draft.value = ''
}

function update(index: number, patch: Partial<SkillItem>) {
  items.value = items.value.map((item, i) => {
    if (i !== index) return item
    const next = { ...item, ...patch }
    if (next.level === undefined) delete next.level
    return next
  })
}

function setLevel(index: number, value: string) {
  update(index, { level: value ? Number(value) : undefined })
}

function remove(index: number) {
  rowKeys.value = rowKeys.value.filter((_, i) => i !== index)
  items.value = items.value.filter((_, i) => i !== index)
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
    <div v-for="(item, index) in items" :key="rowKeys[index]" class="row">
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
  grid-template-columns: minmax(0, 1fr) 7.5em auto;
  gap: 0.4em;
  align-items: center;
}

.name {
  min-width: 0;
}

@media (pointer: coarse) {
  .remove,
  .level,
  .name {
    min-height: 44px;
  }

  .remove {
    min-width: 44px;
  }
}

/* Phones: name and remove share the first line; the level select gets its own, so the name is
   not squeezed to a few letters next to a 7.5em select. */
@media (max-width: 480px) {
  .row {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .name {
    grid-area: 1 / 1;
  }

  .remove {
    grid-area: 1 / 2;
  }

  .level {
    grid-area: 2 / 1 / 3 / -1;
  }
}

.remove {
  padding: 0.3em 0.55em;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text-muted);
}

.remove:hover {
  color: var(--danger);
}
</style>
