<script setup lang="ts">
/**
 * Labelled control wrapper, drawn as a Material 3 filled text field (spec 029): the label sits inside
 * the container above the value, an active indicator underlines it. `warning` renders a non-blocking
 * hint: validation never prevents the user from moving on (spec §5).
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
  <div class="field" :class="{ 'field--disabled': disabled, 'field--warning': warning }">
    <div class="box">
      <label class="label" :for="id">{{ label }}</label>
      <slot :id="id" :disabled="disabled" />
    </div>
    <p v-if="warning" class="supporting warning">{{ warning }}</p>
    <p v-else-if="disabled && disabledReason" class="supporting">{{ disabledReason }}</p>
    <p v-else-if="hint" class="supporting">{{ hint }}</p>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

/* Container: surface-container-high (one step softer than M3's highest), rounded all round, with a ring:
   the outline at rest (4.5:1 on the card, WCAG 1.4.11 asks 3:1), darker on hover, primary in focus (spec 038). */
.box {
  --indicator: var(--md-outline);
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 56px;
  border-radius: var(--shape-md);
  background: var(--md-surface-container-high);
  box-shadow: inset 0 0 0 1px var(--indicator);
  cursor: text;
  transition: box-shadow var(--duration-short) var(--motion-standard);
}

.box:hover {
  --indicator: var(--md-on-surface-variant);
  background: color-mix(in srgb, var(--md-on-surface) calc(var(--state-hover) * 100%), var(--md-surface-container-high));
}

.box:focus-within {
  --indicator: var(--md-primary);
  box-shadow: inset 0 0 0 2px var(--indicator);
}

/* Forced colours drop box-shadow and backgrounds: the edge and the focus ring are outlines there. */
@media (forced-colors: active) {
  .box {
    outline: 1px solid ButtonBorder;
    outline-offset: -1px;
  }

  .box:focus-within {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }
}

/* Drawn over the control, which fills the whole container: all of it is the touch target (M3). */
.label {
  position: absolute;
  top: 8px;
  left: 16px;
  right: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
  font: var(--type-body-small);
  letter-spacing: var(--tracking-body-small);
  color: var(--md-on-surface-variant);
}

.box:focus-within .label {
  color: var(--md-primary);
}

.field--warning .box {
  --indicator: var(--md-error);
}

.field--warning .label,
.warning {
  color: var(--md-error);
}

.supporting {
  margin: 0;
  padding: 0 16px;
  font: var(--type-body-small);
  letter-spacing: var(--tracking-body-small);
  color: var(--md-on-surface-variant);
}

/*
 * A plain control fills the container: no border or background of its own. Composite controls
 * (chip inputs, skill rows) are not direct children and style themselves.
 */
.box > :deep(input:not([type='checkbox'], [type='radio'])),
.box > :deep(textarea),
.box > :deep(select) {
  width: 100%;
  min-height: 56px;
  padding: 24px 16px 8px;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: var(--md-on-surface);
  font: var(--type-body-large);
  letter-spacing: var(--tracking-body-large);
  outline: none;
}

.box > :deep(textarea) {
  resize: vertical;
  min-height: 7em;
}

/* Composite controls (chips, skill rows) sit below the label on the same container. */
.box > :deep(:not(input, textarea, select, label)) {
  padding: 24px 16px 8px;
}

/*
 * Disabled: M3 dims the value to 38 % and the container to 4 %. The label and the supporting text keep
 * full contrast: they say what the field is and why it is off, what the user most needs to read.
 */
.field--disabled .box {
  --indicator: color-mix(in srgb, var(--md-on-surface) 38%, transparent);
  background: color-mix(in srgb, var(--md-on-surface) 4%, transparent);
  cursor: not-allowed;
}

.field--disabled .box :deep(input),
.field--disabled .box :deep(select),
.field--disabled .box :deep(textarea) {
  color: color-mix(in srgb, var(--md-on-surface) 38%, transparent);
  cursor: not-allowed;
}
</style>
