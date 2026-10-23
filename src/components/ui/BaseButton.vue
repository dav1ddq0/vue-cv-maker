<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md'
    disabled?: boolean
    type?: 'button' | 'submit'
  }>(),
  { variant: 'secondary', size: 'md', disabled: false, type: 'button' },
)
</script>

<template>
  <button :type="type" :disabled="disabled" :class="['btn', `btn--${variant}`, `btn--${size}`]">
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  padding: 0.5em 0.9em;
  font-weight: 550;
  transition: background 0.12s ease, border-color 0.12s ease;
  white-space: nowrap;
}

.btn:hover:not(:disabled) {
  background: var(--surface-2);
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn--sm {
  padding: 0.3em 0.6em;
  font-size: 0.86em;
}

.btn--primary {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--on-accent);
}

.btn--primary:hover:not(:disabled) {
  filter: brightness(1.07);
  background: var(--accent);
}

.btn--ghost {
  background: transparent;
  border-color: transparent;
  color: var(--text-muted);
}

.btn--ghost:hover:not(:disabled) {
  background: var(--surface-2);
  color: var(--text);
}

.btn--danger {
  color: var(--danger);
  border-color: transparent;
  background: transparent;
}

.btn--danger:hover:not(:disabled) {
  background: color-mix(in srgb, var(--danger) 10%, transparent);
}
</style>
