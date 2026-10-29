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
      <button type="button" class="remove m3-icon-btn m3-state m3-target" :aria-label="t('skills.removeItem', { name: item.name })" @click="remove(index)">
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
/* Inside a filled text field (spec 029): each skill is a row on the field's container, divided by
   the outline-variant; the level is a compact select and removing is an icon button. */
.items {
  display: flex;
  flex-direction: column;
  padding-bottom: 8px;
}

.row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 8em auto;
  gap: 8px;
  align-items: center;
  min-height: 48px;
  border-bottom: 1px solid var(--md-outline-variant);
}

.name,
.add {
  min-width: 0;
  padding: 8px 0;
  border: 0;
  background: transparent;
  color: var(--md-on-surface);
  font: var(--type-body-large);
  letter-spacing: var(--tracking-body-large);
  outline: none;
}

.name:focus-visible,
.add:focus-visible {
  box-shadow: inset 0 -2px 0 var(--md-primary);
}

.level {
  min-height: 32px;
  padding: 0 8px;
  border: 1px solid var(--md-outline-variant);
  border-radius: var(--shape-sm);
  background: transparent;
  color: var(--md-on-surface-variant);
  font: var(--type-label-large);
}

.level:disabled {
  color: color-mix(in srgb, var(--md-on-surface) 38%, transparent);
  /* Chromium also dims a disabled <select> to 0.7, which took it to ~27 % instead of M3's 38 %. */
  opacity: 1;
}

.add {
  margin-top: 4px;
}

.remove {
  font-size: var(--size-14);
  color: var(--md-on-surface-variant);
}

.remove:hover:not(:disabled) {
  color: var(--md-error);
}

/* Phones: name and remove share the first line; the level select gets its own, so the name is
   not squeezed to a few letters next to the select. */
/* Touch: every control in a row reaches the 48 dp target (spec 029). */
@media (pointer: coarse) {
  .name,
  .add,
  .level {
    min-height: var(--target);
  }
}

@media (max-width: 480px) {
  .row {
    grid-template-columns: minmax(0, 1fr) auto;
    padding-bottom: 8px;
  }

  .name {
    grid-area: 1 / 1;
  }

  .remove {
    grid-area: 1 / 2;
  }

  .level {
    grid-area: 2 / 1 / 3 / -1;
    justify-self: start;
  }
}
</style>
