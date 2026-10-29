<script setup lang="ts">
/**
 * File picker and drop target in one control. The whole surface is a `<label>` around a
 * visually hidden native `<input type="file">`, so click, keyboard (Tab, Enter, Space) and
 * assistive technology work without any scripted role; drag and drop is layered on top.
 *
 * `compact` lays it out as a single row (used next to the profile photo).
 */
import { ref, useId, useTemplateRef } from 'vue'
import { useI18n } from '@/i18n'
import { matchesAccept } from '@/core/fileAccept'

const props = defineProps<{
  accept: string
  busy?: boolean
  disabled?: boolean
  compact?: boolean
  /** Short note under the title, e.g. the accepted formats. */
  hint?: string
  /** Lets an outer `<label for>` (e.g. a form field's) name the native input. */
  inputId?: string
}>()
const emit = defineEmits<{ file: [file: File] }>()
const { t } = useI18n()

const hintId = useId()
const over = ref(false)
const rejected = ref(false)
const root = useTemplateRef<HTMLElement>('root')
const input = useTemplateRef<HTMLInputElement>('input')

function handle(file: File | undefined) {
  if (!file) return
  rejected.value = !matchesAccept(file, props.accept)
  if (!rejected.value) emit('file', file)
}

function onDrop(event: DragEvent) {
  over.value = false
  if (props.disabled || props.busy) return
  handle(event.dataTransfer?.files?.[0])
}

function onPick(event: Event) {
  handle((event.target as HTMLInputElement).files?.[0])
  // Allow re-picking the same file after a failed attempt.
  if (input.value) input.value.value = ''
}

/** Leaving to a child of the control is not leaving the control. */
function onDragLeave(event: DragEvent) {
  if (!root.value?.contains(event.relatedTarget as Node | null)) over.value = false
}
</script>

<template>
  <label
    ref="root"
    class="dropzone"
    :class="{ 'dropzone--over': over, 'dropzone--busy': busy, 'dropzone--compact': compact }"
    :aria-busy="busy || undefined"
    @dragenter.prevent="over = !disabled && !busy"
    @dragover.prevent="over = !disabled && !busy"
    @dragleave="onDragLeave"
    @drop.prevent="onDrop"
  >
    <input
      :id="inputId"
      ref="input"
      type="file"
      class="sr-only"
      :accept="accept"
      :disabled="disabled || busy"
      :aria-describedby="hint || rejected ? hintId : undefined"
      @change="onPick"
    />

    <span class="icon" aria-hidden="true">
      <span v-if="busy" class="spinner" />
      <svg v-else viewBox="0 0 24 24" width="1.25em" height="1.25em" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 16V4m0 0L8 8m4-4 4 4" />
        <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
      </svg>
    </span>

    <span class="copy">
      <span class="title" aria-live="polite"><slot>{{ t('importView.dropzone') }}</slot></span>
      <span v-if="rejected" :id="hintId" class="note note--error" role="alert">{{ t('upload.rejected') }}</span>
      <span v-else-if="hint" :id="hintId" class="note">{{ hint }}</span>
    </span>
  </label>
</template>

<style scoped>
.dropzone {
  position: relative;
  --dz-border: var(--border);
  --dz-bg: var(--surface);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 16px;
  text-align: center;
  color: var(--text);
  border: 1.5px dashed var(--dz-border);
  border-radius: var(--radius);
  background: var(--dz-bg);
  cursor: pointer;
}

.dropzone:hover {
  --dz-border: var(--accent);
  --dz-bg: var(--surface-2);
}

.dropzone--over {
  --dz-border: var(--accent);
  --dz-bg: var(--accent-soft);
}

/* The native input holds focus; the visible control shows the ring. */
.dropzone:has(input:focus-visible) {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

@supports not selector(:has(*)) {
  .dropzone:focus-within {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
}

.dropzone:has(input:disabled) {
  cursor: not-allowed;
}

.dropzone--busy {
  cursor: progress;
}

.dropzone:has(input:disabled):not(.dropzone--busy) {
  opacity: 0.55;
}

/*
 * The hidden native input must stay 1px wherever the dropzone is placed: a form field wrapper
 * (BaseField) styles every descendant input with width: 100%, which out-specifies the global
 * .sr-only and used to stretch it across the page, adding horizontal scroll.
 */
.dropzone > input[type='file'] {
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 2.6em;
  height: 2.6em;
  border-radius: 50%;
  color: var(--accent);
  background: var(--accent-soft);
}

.dropzone--over .icon {
  color: var(--on-accent);
  background: var(--accent);
}

.copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.title {
  font-size: var(--size-14);
  font-weight: 600;
}

.note {
  font-size: var(--size-12);
  color: var(--text-muted);
}

.note--error {
  color: var(--danger);
}

.dropzone--compact {
  flex-direction: row;
  gap: 12px;
  padding: 8px 12px;
  text-align: left;
}

.dropzone--compact .icon {
  width: 2.2em;
  height: 2.2em;
}

.spinner {
  width: 1.15em;
  height: 1.15em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
}

@media (prefers-reduced-motion: no-preference) {
  .dropzone {
    transition: border-color 0.15s ease, background-color 0.15s ease;
  }

  .icon {
    transition: background-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
  }

  .dropzone--over .icon {
    transform: scale(1.1);
  }

  .spinner {
    animation: dropzone-spin 0.8s linear infinite;
  }
}

@keyframes dropzone-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
