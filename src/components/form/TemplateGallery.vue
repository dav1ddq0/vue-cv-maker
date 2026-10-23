<script setup lang="ts">
/**
 * The template picker: a grid of cards with a thumbnail, tags and a one-line description.
 * Presentational only: the active template and the accent each card previews come in as
 * props, and a click goes out as `pick`.
 */
import { useI18n } from '@/i18n'
import type { TemplateDefinition } from '@/types/template'

defineProps<{
  templates: TemplateDefinition[]
  activeId: string
  /** The accent a card would produce if picked (its own default, or the user's choice). */
  accentFor: (id: string) => string
}>()
const emit = defineEmits<{ pick: [id: string] }>()
const { t } = useI18n()
</script>

<template>
  <section class="block">
    <h3 class="subtitle">{{ t('style.template') }}</h3>
    <ul class="templates">
      <li v-for="template in templates" :key="template.id">
        <button
          type="button"
          class="card"
          :class="{ 'card--active': activeId === template.id }"
          :aria-pressed="activeId === template.id"
          @click="emit('pick', template.id)"
        >
          <!-- Static, authored SVG from the template definition — never user input. -->
          <span
            class="thumb"
            role="img"
            :aria-label="template.name"
            :style="{ color: accentFor(template.id) }"
            v-html="template.thumbnail"
          />
          <span class="card-name">{{ template.name }}</span>
          <span class="card-tags">
            <span v-for="tag in template.tags" :key="tag" class="tag">{{ t(tag) }}</span>
          </span>
          <span class="card-desc">{{ t(template.descriptionKey) }}</span>
        </button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.block {
  display: flex;
  flex-direction: column;
  gap: 0.8em;
}

.subtitle {
  margin: 0;
  font-size: 0.95em;
  font-weight: 600;
}

.templates {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.8em;
}

.card {
  display: grid;
  gap: 0.3em;
  width: 100%;
  text-align: left;
  padding: 0.6em;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.card--active {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent);
}

.thumb {
  display: block;
  width: 100%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: #fff;
}

.thumb :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.card-name {
  font-weight: 600;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25em;
}

/* Lets someone choose by shape without reading three paragraphs. */
.tag {
  font-size: 0.68em;
  letter-spacing: 0.02em;
  padding: 0.1em 0.45em;
  border-radius: 999px;
  background: var(--surface-2);
  color: var(--text-muted);
  white-space: nowrap;
}

.card--active .tag {
  background: var(--accent-soft);
}

.card-desc {
  font-size: 0.78em;
  color: var(--text-muted);
  line-height: 1.35;
}
</style>
