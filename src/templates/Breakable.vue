<script setup lang="ts">
/**
 * Contact text (e-mail, URL) with line-break opportunities at sensible points: a narrow column
 * then wraps at "@" or before a dot instead of splitting a word (spec 033). Renders plain text and
 * <wbr>, so it reads, copies and prints exactly like the text itself.
 */
import { computed } from 'vue'
import { breakParts } from '@/templates/shared'

const props = defineProps<{ text: string }>()
const parts = computed(() => breakParts(props.text))
</script>

<template>
  <template v-for="(part, i) in parts" :key="i"><wbr v-if="i > 0" />{{ part }}</template>
</template>
