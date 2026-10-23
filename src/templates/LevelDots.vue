<script setup lang="ts">
/**
 * Five marks for a 1–5 level, drawn as dots, stars, bars or dashes. Shared by
 * templates that want a visual level; the text label is announced to assistive
 * technology instead of the decorative marks.
 * Colour comes from `--dots-color` when a template sets it, else the accent.
 */
withDefaults(
  defineProps<{ score: number; label: string; variant?: 'dots' | 'stars' | 'bars' | 'dashes' }>(),
  { variant: 'dots' },
)
</script>

<template>
  <span class="marks" :class="`v-${variant}`" role="img" :aria-label="label">
    <span v-for="n in 5" :key="n" class="mark" :class="{ on: n <= score }" aria-hidden="true" />
  </span>
</template>

<style scoped>
.marks {
  display: inline-flex;
  align-items: center;
  gap: 0.28em;
  vertical-align: middle;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}

.mark {
  display: block;
  background: var(--dots-color, var(--cv-accent));
  opacity: 0.28;
}

.mark.on {
  opacity: 1;
}

.v-dots .mark {
  width: 0.6em;
  height: 0.6em;
  border-radius: 50%;
}

.v-stars {
  gap: 0.12em;
}

.v-stars .mark {
  width: 0.85em;
  height: 0.85em;
  clip-path: polygon(
    50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%,
    50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%
  );
}

.v-bars .mark {
  width: 0.9em;
  height: 0.42em;
  border-radius: 0.12em;
}

.v-dashes {
  gap: 0.2em;
}

.v-dashes .mark {
  width: 1.1em;
  height: 0.14em;
  border-radius: 0.07em;
}
</style>
