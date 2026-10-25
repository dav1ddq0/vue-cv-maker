<script setup lang="ts">
/** A CV's template and accent on the My CVs list (spec 021); absent for entries indexed before it. */
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import { getTemplate } from '@/templates/registry'
import type { CVSummary } from '@/types/cv'

const props = defineProps<{ doc: CVSummary }>()
const { t } = useI18n()

const name = computed(() => (props.doc.templateId ? getTemplate(props.doc.templateId).name : ''))
</script>

<template>
  <span v-if="name" class="tag">
    <span v-if="doc.accentColor" class="swatch" :style="{ background: doc.accentColor }" aria-hidden="true" />
    {{ t('documents.template', { name }) }}
  </span>
</template>

<style scoped>
.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  min-width: 0;
  font-size: 0.8em;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.swatch {
  flex-shrink: 0;
  width: 0.8em;
  height: 0.8em;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.15);
}
</style>
