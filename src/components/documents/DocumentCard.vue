<script setup lang="ts">
/** One CV on the phone list: the whole card opens it, a separate button opens its actions. */
import { computed } from 'vue'
import { formatDate, useI18n } from '@/i18n'
import type { CVSummary } from '@/types/cv'
import DocumentTemplateTag from './DocumentTemplateTag.vue'

const props = defineProps<{ doc: CVSummary; active: boolean }>()
const emit = defineEmits<{ open: []; menu: [] }>()
const { t } = useI18n()

const label = computed(() => props.doc.fullName || props.doc.title || t('documents.untitled'))
/** The document title is a second line only when it says something the name does not. */
const showTitle = computed(() => !!props.doc.title && props.doc.title !== label.value)
/** Up to two initials; a monogram is honest, a fake thumbnail would not be. */
const initials = computed(
  () =>
    label.value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]!.toUpperCase())
      .join('') || '·',
)
</script>

<template>
  <li class="card" :class="{ 'card--active': active }">
    <button type="button" class="main" @click="emit('open')">
      <span class="monogram" aria-hidden="true">{{ initials }}</span>
      <span class="text">
        <span class="name">{{ label }}</span>
        <span v-if="showTitle" class="meta">{{ doc.title }}</span>
        <span class="meta">{{ t('documents.updated', { date: formatDate(doc.updatedAt) }) }}</span>
        <DocumentTemplateTag :doc="doc" />
      </span>
    </button>
    <button type="button" class="menu" :aria-label="t('documents.more', { title: doc.title })" aria-haspopup="dialog" @click="emit('menu')">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>
    </button>
  </li>
</template>

<style scoped>
.card {
  display: flex;
  align-items: stretch;
  border: 1px solid var(--border);
  border-radius: var(--shape-lg);
  background: var(--surface);
}

.card--active {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent);
}

.main {
  display: flex;
  align-items: center;
  gap: 0.9em;
  flex: 1;
  min-width: 0;
  min-height: 96px;
  padding: 0.7em 0.5em 0.7em 0.8em;
  border: 0;
  border-radius: var(--shape-lg) 0 0 var(--shape-lg);
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.monogram {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 700;
  font-size: var(--size-16);
}

.text {
  display: flex;
  flex-direction: column;
  gap: 0.15em;
  min-width: 0;
}

.name {
  font-weight: 600;
  font-size: var(--size-16);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta {
  font-size: var(--size-12);
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 52px;
  border: 0;
  border-radius: 0 var(--shape-lg) var(--shape-lg) 0;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}
</style>
