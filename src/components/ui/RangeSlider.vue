<script setup lang="ts">
/**
 * A slider for a number between two limits (spec 044), drawn as a Material 3 slider inside a field:
 * a 4 px track that fills with the primary colour up to a 20 px round thumb, a halo around the thumb
 * on hover, focus and drag, and a touch target of 48 dp. The native `<input type="range">` draws
 * edge to edge and, on iOS, a pill; only its behaviour is kept (keyboard, drag, assistive technology).
 * The label and the value are the field's, so the slider carries only its own name.
 */
import { computed } from 'vue'

const props = defineProps<{ id?: string; min: number; max: number; step: number; disabled?: boolean }>()
const model = defineModel<number>({ required: true })

/** Where the thumb sits, 0 to 1, for the filled part of the track. */
const ratio = computed(() => Math.min(1, Math.max(0, (model.value - props.min) / (props.max - props.min))))
</script>

<template>
  <div class="slider" :style="{ '--ratio': ratio }">
    <input
      :id="id"
      v-model.number="model"
      class="range"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
    />
  </div>
</template>

<style scoped>
.slider {
  display: flex;
  align-items: center;
  /* The thumb is half outside the track at either end; this keeps it inside the field's padding. */
  padding-inline: 12px;
}

.range {
  appearance: none;
  box-sizing: border-box;
  width: 100%;
  height: 24px;
  margin: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
  /* The track is a gradient over the input's own width; the thumb's travel is that width less its size. */
  --thumb: 20px;
}

.range:disabled {
  cursor: not-allowed;
}

.range::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: var(--shape-full);
  background: linear-gradient(
    to right,
    var(--md-primary) 0 calc(var(--thumb) / 2 + (100% - var(--thumb)) * var(--ratio)),
    var(--md-outline-variant) 0
  );
}

.range::-moz-range-track {
  height: 4px;
  border-radius: var(--shape-full);
  background: var(--md-outline-variant);
}

.range::-moz-range-progress {
  height: 4px;
  border-radius: var(--shape-full);
  background: var(--md-primary);
}

.range::-webkit-slider-thumb {
  appearance: none;
  width: var(--thumb);
  height: var(--thumb);
  margin-top: -8px;
  border: 0;
  border-radius: 50%;
  background: var(--md-primary);
  box-shadow: var(--elevation-1);
  transition: box-shadow var(--duration-short) var(--motion-standard);
}

.range::-moz-range-thumb {
  box-sizing: border-box;
  width: var(--thumb);
  height: var(--thumb);
  border: 0;
  border-radius: 50%;
  background: var(--md-primary);
  box-shadow: var(--elevation-1);
}

/* The halo of the state layers: the primary colour at the hover, focus and drag opacities. */
.range:hover::-webkit-slider-thumb {
  box-shadow: var(--elevation-1), 0 0 0 8px color-mix(in srgb, var(--md-primary) calc(var(--state-hover) * 100%), transparent);
}

.range:focus-visible::-webkit-slider-thumb,
.range:active::-webkit-slider-thumb {
  box-shadow: var(--elevation-1), 0 0 0 10px color-mix(in srgb, var(--md-primary) calc(var(--state-focus) * 100%), transparent);
}

.range:focus-visible::-moz-range-thumb,
.range:active::-moz-range-thumb {
  box-shadow: var(--elevation-1), 0 0 0 10px color-mix(in srgb, var(--md-primary) calc(var(--state-focus) * 100%), transparent);
}

.range:focus-visible {
  outline: none;
}

/* M3 disabled: content at 38 %, track at 12 %. */
.range:disabled::-webkit-slider-thumb {
  background: color-mix(in srgb, var(--md-on-surface) 38%, transparent);
  box-shadow: none;
}

.range:disabled::-moz-range-thumb {
  background: color-mix(in srgb, var(--md-on-surface) 38%, transparent);
  box-shadow: none;
}

.range:disabled::-webkit-slider-runnable-track,
.range:disabled::-moz-range-track {
  background: color-mix(in srgb, var(--md-on-surface) 12%, transparent);
}

.range:disabled::-moz-range-progress {
  background: color-mix(in srgb, var(--md-on-surface) 38%, transparent);
}

/* Touch: the 48 dp target is the input's height, the track and the thumb stay as drawn. */
@media (pointer: coarse) {
  .range {
    height: var(--target);
  }

  .range::-webkit-slider-thumb {
    margin-top: -8px;
  }
}
</style>
