<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@/i18n'

const props = defineProps<{ accept: string; busy?: boolean }>()
const emit = defineEmits<{ file: [file: File] }>()
const { t } = useI18n()

const over = ref(false)
const input = ref<HTMLInputElement | null>(null)

function onDrop(event: DragEvent) {
  over.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file && matchesAccept(file)) emit('file', file)
}

function onPick(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) emit('file', file)
  // Allow re-picking the same file after a failed attempt.
  if (input.value) input.value.value = ''
}

function matchesAccept(file: File): boolean {
  return props.accept
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .some((part) =>
      part.startsWith('.') ? file.name.toLowerCase().endsWith(part) : file.type === part,
    )
}
</script>

<template>
  <div
    class="dropzone"
    :class="{ 'dropzone--over': over, 'dropzone--busy': busy }"
    @dragover.prevent="over = true"
    @dragleave="over = false"
    @drop.prevent="onDrop"
    @click="input?.click()"
    @keydown.enter="input?.click()"
    @keydown.space.prevent="input?.click()"
    tabindex="0"
    role="button"
  >
    <input ref="input" type="file" class="sr-only" :accept="accept" @change="onPick" />
    <p class="text">
      <slot>{{ t('importView.dropzone') }}</slot>
    </p>
  </div>
</template>

<style scoped>
.dropzone {
  border: 1.5px dashed var(--border);
  border-radius: var(--radius);
  padding: 1.6em 1em;
  text-align: center;
  background: var(--surface);
  cursor: pointer;
  transition: border-color 0.12s ease, background 0.12s ease;
}

.dropzone--over {
  border-color: var(--accent);
  background: var(--accent-soft);
}

.dropzone--busy {
  pointer-events: none;
  opacity: 0.6;
}

.text {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.9em;
}
</style>
