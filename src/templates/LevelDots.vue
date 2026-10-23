<script setup lang="ts">
/**
 * Five dots for a 1–5 level. Shared by templates that want a visual level; the
 * text label is announced to assistive technology instead of the decorative dots.
 * Colour comes from `--dots-color` when a template sets it, else the accent.
 */
defineProps<{ score: number; label: string }>()
</script>

<template>
  <span class="dots" role="img" :aria-label="label">
    <span v-for="n in 5" :key="n" class="dot" :class="{ on: n <= score }" aria-hidden="true" />
  </span>
</template>

<style scoped>
.dots {
  display: inline-flex;
  gap: 0.28em;
  vertical-align: middle;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}

.dot {
  width: 0.6em;
  height: 0.6em;
  border-radius: 50%;
  background: var(--dots-color, var(--cv-accent));
  opacity: 0.28;
}

.dot.on {
  opacity: 1;
}
</style>
