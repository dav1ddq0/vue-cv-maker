<script setup lang="ts">
/**
 * The template picker: a grid of cards with a thumbnail, tags and a one-line description.
 * Presentational only: the active template and the accent each card previews come in as
 * props, and a click goes out as `pick`.
 */
import { computed, ref } from 'vue'
import { useI18n } from '@/i18n'
import type { TemplateDefinition } from '@/types/template'

const props = defineProps<{
  templates: TemplateDefinition[]
  activeId: string
  /** The accent a card would produce if picked (its own default, or the user's choice). */
  accentFor: (id: string) => string
}>()
const emit = defineEmits<{ pick: [id: string] }>()
const { t } = useI18n()

/** Filters are the templates' own tags (spec 019): a new template is filterable by declaring them. */
const FILTERS = ['tags.oneColumn', 'tags.twoColumn', 'tags.photo', 'tags.ats'] as const
const filter = ref<(typeof FILTERS)[number] | null>(null)
const available = computed(() => FILTERS.filter((tag) => props.templates.some((tpl) => tpl.tags.includes(tag))))
/** The active template stays listed whatever the filter, so the current choice never disappears. */
const shown = computed(() =>
  filter.value === null
    ? props.templates
    : props.templates.filter((tpl) => tpl.tags.includes(filter.value!) || tpl.id === props.activeId),
)
</script>

<template>
  <section class="block">
    <h3 class="subtitle">{{ t('style.template') }}</h3>
    <div class="filters" role="group" :aria-label="t('style.filterLabel')">
      <button type="button" class="filter m3-chip m3-state m3-target" :aria-pressed="filter === null" @click="filter = null">
        {{ t('style.filterAll') }} · {{ templates.length }}
      </button>
      <button
        v-for="tag in available"
        :key="tag"
        type="button"
        class="filter m3-chip m3-state m3-target"
        :aria-pressed="filter === tag"
        @click="filter = filter === tag ? null : tag"
      >
        {{ t(tag) }}
      </button>
    </div>
    <ul class="templates">
      <li v-for="template in shown" :key="template.id">
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

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

/*
 * Dark theme: the thumbnails are drawings of a page, not the CV, so they take the theme's tones
 * instead of glaring white (spec 029). Their four fixed colours map onto M3 roles; white on the
 * accent (headers) stays white.
 */
:root[data-theme='dark'] .thumb {
  background: var(--md-surface-container-highest);
}

:root[data-theme='dark'] .thumb :deep(svg > rect:first-child[fill='#fff']) {
  fill: var(--md-surface-container-highest);
}

:root[data-theme='dark'] .thumb :deep([fill='#1f2937']) {
  fill: var(--md-on-surface);
}

:root[data-theme='dark'] .thumb :deep([fill='#9ca3af']) {
  fill: var(--md-on-surface-variant);
}

:root[data-theme='dark'] .thumb :deep([fill='#d1d5db']) {
  fill: var(--md-outline-variant);
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
  border-radius: var(--shape-full);
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

/* Phones: one swipeable row that snaps card by card, instead of a tall grid to scroll past. The
   page above it keeps the preview in view, so a short card is enough to choose by. */
@media (max-width: 640px) {
  .templates {
    display: flex;
    gap: 0.7em;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-padding-inline: 0.2em;
    overscroll-behavior-x: contain;
    padding: 0.2em 0.2em 0.6em;
  }

  .templates > li {
    flex: 0 0 148px;
    scroll-snap-align: start;
  }

  .card-desc {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
</style>
