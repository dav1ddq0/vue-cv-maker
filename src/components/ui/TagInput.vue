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
/* Inside a filled text field: the chips and the entry share the field's container (spec 029). */
.tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 4px 0 8px;
}

/* M3 input chip: 32 dp, outlined, trailing remove icon. */
.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 32px;
  max-width: 100%;
  padding: 0 4px 0 12px;
  border: 1px solid var(--md-outline-variant);
  border-radius: var(--shape-sm);
  color: var(--md-on-surface-variant);
  font: var(--type-label-large);
  letter-spacing: var(--tracking-label-large);
}

.remove {
  width: 24px;
  height: 24px;
  font-size: 12px;
}

.entry {
  flex: 1;
  min-width: 8em;
  padding: 4px 0;
  border: 0;
  background: transparent;
  color: var(--md-on-surface);
  font: var(--type-body-large);
  letter-spacing: var(--tracking-body-large);
  outline: none;
}
</style>
