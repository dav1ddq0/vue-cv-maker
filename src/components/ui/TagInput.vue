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
      <button type="button" class="remove" :aria-label="`${tag} ✕`" @click="removeAt(index)">✕</button>
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
.tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35em;
  padding: 0.35em;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
  background: var(--accent-soft);
  color: var(--text);
  border-radius: 999px;
  padding: 0.15em 0.5em;
  font-size: 0.86em;
}

.remove {
  border: 0;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.8em;
  padding: 0;
  line-height: 1;
}

.entry {
  flex: 1;
  min-width: 8em;
  border: 0 !important;
  background: transparent !important;
  padding: 0.25em !important;
}

.entry:focus {
  outline: none;
}

/* Touch: taller chips so the remove button is a full-size target without overlapping its neighbours. */
@media (pointer: coarse) {
  .tag {
    min-height: 44px;
    padding: 0 0.2em 0 0.9em;
  }

  .remove {
    min-width: 44px;
    min-height: 44px;
  }
}
</style>
