<script setup lang="ts">
/** Comma/Enter separated chips — used for skill items and experience highlights. */
import { ref } from 'vue'

defineProps<{ placeholder?: string; id?: string }>()
const tags = defineModel<string[]>({ required: true })

const draft = ref('')

function commit() {
  const parts = draft.value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
  if (parts.length) tags.value = [...tags.value, ...parts]
  draft.value = ''
}

function removeAt(index: number) {
  tags.value = tags.value.filter((_, i) => i !== index)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault()
    commit()
    return
  }
  // Backspace on an empty field removes the last chip — the expected behaviour here.
  if (event.key === 'Backspace' && !draft.value && tags.value.length) {
    removeAt(tags.value.length - 1)
  }
}
</script>

<template>
  <div class="tags">
    <span v-for="(tag, index) in tags" :key="`${tag}-${index}`" class="tag">
      {{ tag }}
      <button type="button" class="remove m3-icon-btn m3-state m3-target" :aria-label="`${tag} ✕`" @click="removeAt(index)">✕</button>
    </span>
    <input
      :id="id"
      v-model="draft"
      class="entry"
      :placeholder="placeholder"
      @keydown="onKeydown"
      @blur="commit"
    />
  </div>
</template>

<style scoped>
/* Inside a filled text field: each entry is a row divided by the outline-variant, like the skills in
   SkillItemsEditor, and the entry field closes the list (spec 038). */
.tags {
  display: flex;
  flex-direction: column;
  padding-bottom: 8px;
}

.tag {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 48px;
  padding: 8px 0;
  border-bottom: 1px solid var(--md-outline-variant);
  color: var(--md-on-surface);
  font: var(--type-body-large);
  letter-spacing: var(--tracking-body-large);
  overflow-wrap: anywhere;
}

.remove {
  font-size: var(--size-14);
  flex: none;
  color: var(--md-on-surface-variant);
}

.remove:hover:not(:disabled) {
  color: var(--md-error);
}

.entry {
  margin-top: 4px;
  min-width: 0;
  padding: 8px 0;
  border: 0;
  background: transparent;
  color: var(--md-on-surface);
  font: var(--type-body-large);
  letter-spacing: var(--tracking-body-large);
  outline: none;
}

.entry:focus-visible {
  box-shadow: inset 0 -2px 0 var(--md-primary);
}

@media (pointer: coarse) {
  .entry {
    min-height: var(--target);
  }
}
</style>
