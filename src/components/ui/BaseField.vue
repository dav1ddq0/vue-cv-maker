<script setup lang="ts">
/**
 * Labelled control wrapper. `warning` renders a non-blocking hint: validation
 * never prevents the user from moving on (spec §5).
 */
import { useId } from 'vue'

defineProps<{
  label: string
  hint?: string
  warning?: string
  disabled?: boolean
  disabledReason?: string
}>()

const id = useId()
</script>

<template>
  <div class="field" :class="{ 'field--disabled': disabled }">
    <label class="label" :for="id">{{ label }}</label>
    <slot :id="id" :disabled="disabled" />
    <p v-if="warning" class="warning">{{ warning }}</p>
    <p v-else-if="disabled && disabledReason" class="hint">{{ disabledReason }}</p>
    <p v-else-if="hint" class="hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.3em;
  min-width: 0;
}

/*
 * Only the control is dimmed. Dimming the whole field also dimmed the label and
 * the sentence explaining the disabled state — the one text the user most needs
 * to read at that moment — down to 2.25:1.
 */
.field--disabled :deep(input),
.field--disabled :deep(select),
.field--disabled :deep(textarea) {
  opacity: 0.55;
}

.label {
  font-size: 0.82em;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.01em;
}

.hint,
.warning {
  margin: 0;
  font-size: 0.8em;
  color: var(--text-muted);
}

.warning {
  color: var(--danger);
}

.field :deep(input),
.field :deep(textarea),
.field :deep(select) {
  width: 100%;
  padding: 0.5em 0.65em;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
}

.field :deep(textarea) {
  resize: vertical;
  min-height: 5em;
  line-height: 1.5;
}

.field :deep(input:disabled),
.field :deep(textarea:disabled) {
  background: var(--surface-2);
  cursor: not-allowed;
}
</style>
