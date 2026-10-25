<script setup lang="ts">
/** Live, reactive preview. Paginated output is a separate component on purpose —
 *  paged.js must never touch a Vue-managed subtree (spec §6). */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useCvStore } from '@/stores/cv'
import { useUiStore } from '@/stores/ui'
import { useI18n } from '@/i18n'
import { useIsCompact, useIsPhone } from '@/composables/useIsPhone'
import CvRenderer from './CvRenderer.vue'

const cv = useCvStore()
const ui = useUiStore()
const { t } = useI18n()

const isPhone = useIsPhone()
const isCompact = useIsCompact()
const zoom = ref(0.72)

/** A4 width in CSS px (210mm at 96dpi). */
const PAGE_PX = 793.7
const scroller = ref<HTMLElement | null>(null)
const available = ref(0)
let observer: ResizeObserver | undefined

onMounted(() => {
  const el = scroller.value
  if (!el || typeof ResizeObserver === 'undefined') return
  observer = new ResizeObserver(([entry]) => {
    if (entry) available.value = entry.contentRect.width
  })
  observer.observe(el)
})
onBeforeUnmount(() => observer?.disconnect())

/** On phones and tablets the page is fitted to its column instead of using the slider (specs 013, 016). */
const effectiveZoom = computed(() => {
  if (!isCompact.value || available.value <= 0) return zoom.value
  return Math.min(1, available.value / PAGE_PX)
})

const scaleStyle = computed(() => ({
  transform: `scale(${effectiveZoom.value})`,
  // A scaled element keeps its layout box, which would leave a large gap below.
  marginBottom: `${(effectiveZoom.value - 1) * 297}mm`,
}))
</script>

<template>
  <section class="pane" :aria-label="t('preview.title')">
    <header v-if="!isPhone" class="bar">
      <h2 class="title">{{ t('preview.title') }}</h2>
      <label v-if="!isCompact" class="zoom">
        <span class="sr-only">Zoom</span>
        <input v-model.number="zoom" type="range" min="0.4" max="1" step="0.02" />
        <output>{{ Math.round(zoom * 100) }}%</output>
      </label>
    </header>

    <div ref="scroller" class="scroll">
      <div class="page-wrap" :style="scaleStyle">
        <div class="cv-page">
          <CvRenderer :data="cv.data" :template-id="ui.templateId" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pane {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--surface-2);
  border-left: 1px solid var(--border);
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1em;
  padding: 0.5em 0.9em;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}

.title {
  margin: 0;
  font-size: 0.86em;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.zoom {
  display: flex;
  align-items: center;
  gap: 0.5em;
  font-size: 0.8em;
  color: var(--text-muted);
}

.zoom input {
  width: 7em;
}

.scroll {
  flex: 1;
  overflow: auto;
  padding: 1.2em;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

/* Phones: a slimmer margin so the page uses the width it is fitted to. */
@media (max-width: 640px) {
  .scroll {
    padding: 0.8em;
    /* The scaled page keeps its 794px layout box; nothing useful is out there to scroll to. */
    overflow-x: hidden;
  }
}

.page-wrap {
  transform-origin: top center;
}

.cv-page {
  box-shadow: 0 2px 18px rgba(16, 24, 40, 0.14);
}
</style>
