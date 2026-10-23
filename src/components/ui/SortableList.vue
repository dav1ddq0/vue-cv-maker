<script setup lang="ts" generic="T extends { id: string }">
/**
 * Drag-to-reorder with a keyboard fallback.
 *
 * Uses native HTML5 drag events rather than a library: the lists here are short,
 * and the move-up/move-down buttons are required for keyboard users regardless,
 * so a dependency would only cover the pointer half of the interaction.
 */
import { ref } from 'vue'
import { useI18n } from '@/i18n'

const props = defineProps<{ items: T[] }>()
const emit = defineEmits<{ reorder: [items: T[]] }>()
const { t } = useI18n()

const draggingIndex = ref<number | null>(null)
const overIndex = ref<number | null>(null)

function onDragStart(index: number, event: DragEvent) {
  draggingIndex.value = index
  event.dataTransfer?.setData('text/plain', String(index))
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

function onDragOver(index: number, event: DragEvent) {
  event.preventDefault()
  overIndex.value = index
}

function onDrop(index: number) {
  if (draggingIndex.value !== null) move(draggingIndex.value, index)
  draggingIndex.value = null
  overIndex.value = null
}

function move(from: number, to: number) {
  if (from === to || to < 0 || to >= props.items.length) return
  const next = [...props.items]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  emit('reorder', next)
}
</script>

<template>
  <ul class="list">
    <li
      v-for="(item, index) in items"
      :key="item.id"
      class="item"
      :class="{ 'item--over': overIndex === index, 'item--dragging': draggingIndex === index }"
      draggable="true"
      @dragstart="onDragStart(index, $event)"
      @dragover="onDragOver(index, $event)"
      @drop="onDrop(index)"
      @dragend="draggingIndex = null; overIndex = null"
    >
      <div class="handle" aria-hidden="true">⠿</div>
      <div class="content">
        <slot :item="item" :index="index" />
      </div>
      <div class="move">
        <button
          type="button"
          class="move-btn"
          :disabled="index === 0"
          :aria-label="t('actions.moveUp')"
          @click="move(index, index - 1)"
        >
          ↑
        </button>
        <button
          type="button"
          class="move-btn"
          :disabled="index === items.length - 1"
          :aria-label="t('actions.moveDown')"
          @click="move(index, index + 1)"
        >
          ↓
        </button>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6em;
}

.item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.5em;
  align-items: start;
  padding: 0.7em;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.item--over {
  border-color: var(--accent);
  box-shadow: inset 0 2px 0 var(--accent);
}

.item--dragging {
  opacity: 0.5;
}

.handle {
  cursor: grab;
  color: var(--text-muted);
  padding-top: 0.2em;
  user-select: none;
}

.content {
  min-width: 0;
}

.move {
  display: flex;
  flex-direction: column;
  gap: 0.15em;
}

/* 32px: these are the only keyboard and touch alternative to dragging, so
   they have to clear the WCAG 2.2 target minimum comfortably. */
.move-btn {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-muted);
  border-radius: var(--radius-sm);
  line-height: 1;
  padding: 0;
}

.move-btn:hover:not(:disabled) {
  background: var(--surface-2);
  color: var(--text);
}

.move-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
