<script setup lang="ts">
/**
 * Material 3 common buttons (spec 029): primary = filled, tonal = filled tonal, secondary = outlined,
 * ghost = text, danger = text in the error colour. 40 dp tall (32 for `sm`), with a 48 dp target.
 */
withDefaults(
  defineProps<{
    variant?: 'primary' | 'tonal' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md'
    disabled?: boolean
    type?: 'button' | 'submit'
  }>(),
  { variant: 'secondary', size: 'md', disabled: false, type: 'button' },
)
</script>

<template>
  <button :type="type" :disabled="disabled" :class="['btn', 'm3-state', 'm3-target', `btn--${variant}`, `btn--${size}`]">
    <slot />
  </button>
</template>

<style scoped>
.btn {
  --container: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 24px;
  border: 1px solid transparent;
  border-radius: var(--shape-full);
  font: var(--type-label-large);
  letter-spacing: var(--tracking-label-large);
  white-space: nowrap;
}

.btn--sm {
  min-height: 32px;
  padding: 0 16px;
}

.btn--primary {
  --container: var(--md-primary);
  color: var(--md-on-primary);
}

.btn--primary:hover:not(:disabled) {
  box-shadow: var(--elevation-1);
}

.btn--tonal {
  --container: var(--md-secondary-container);
  color: var(--md-on-secondary-container);
}

.btn--secondary {
  border-color: var(--md-outline-variant);
  color: var(--md-primary);
}

.btn--ghost {
  padding-inline: 12px;
  color: var(--md-primary);
}

.btn--danger {
  padding-inline: 12px;
  color: var(--md-error);
}

/* M3 disabled: 12 % container, 38 % content, whatever the variant. */
.btn:disabled {
  --container: transparent;
  border-color: color-mix(in srgb, var(--md-on-surface) 12%, transparent);
  color: color-mix(in srgb, var(--md-on-surface) 38%, transparent);
  cursor: not-allowed;
  box-shadow: none;
}

.btn--primary:disabled,
.btn--tonal:disabled {
  --container: color-mix(in srgb, var(--md-on-surface) 12%, transparent);
  border-color: transparent;
}
</style>
