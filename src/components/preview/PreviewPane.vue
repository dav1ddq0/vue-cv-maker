<script setup lang="ts">
/** Live, reactive preview. Paginated output is a separate component on purpose —
 *  paged.js must never touch a Vue-managed subtree (spec §6). */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useCvStore } from '@/stores/cv'
import { useUiStore } from '@/stores/ui'
import { useI18n } from '@/i18n'
import { useIsCompact, useIsPhone } from '@/composables/useIsPhone'
import { getTemplate } from '@/templates/registry'
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
let userZoomed = false

onMounted(() => {
  const el = scroller.value
  if (!el || typeof ResizeObserver === 'undefined') return
  observer = new ResizeObserver(([entry]) => {
    if (!entry) return
    available.value = entry.contentRect.width
    // Until the user picks a zoom, the page follows the panel width (spec 018).
    if (!userZoomed) fit()
  })
  observer.observe(el)
})
onBeforeUnmount(() => observer?.disconnect())

/** On phones and tablets the page is fitted to its column instead of using the slider (specs 013, 016). */
const effectiveZoom = computed(() => {
  if (!isCompact.value || available.value <= 0) return zoom.value
  return Math.min(1, available.value / PAGE_PX)
})

const ZOOM_MIN = 0.4
const ZOOM_MAX = 1.2
const ZOOM_STEP = 0.1
const zoomPercent = computed(() => Math.round(zoom.value * 100))

function zoomBy(delta: number) {
  userZoomed = true
  zoom.value = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round((zoom.value + delta) * 10) / 10))
}

/** The zoom at which the page fills the panel (`contentRect` already excludes the padding). */
function fit() {
  if (available.value > 0) zoom.value = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, available.value / PAGE_PX))
}

function fitToPanel() {
  userZoomed = false
  fit()
}

const templateName = computed(() => getTemplate(ui.templateId).name)

const scaleStyle = computed(() => ({
  transform: `scale(${effectiveZoom.value})`,
  // A scaled element keeps its layout box, which would leave a large gap below.
  marginBottom: `${(effectiveZoom.value - 1) * 297}mm`,
}))
</script>

<template>
  <section class="pane" :aria-label="t('preview.title')">
    <header v-if="!isPhone" class="bar">
      <h2 class="title" :class="{ 'sr-only': !isCompact }">{{ t('preview.title') }}</h2>
      <button
        v-if="!isCompact"
        type="button"
        class="chip"
        :aria-label="t('preview.changeTemplate', { name: templateName })"
        @click="ui.goTo('style')"
      >
        <span class="swatch" :style="{ background: cv.data.style.accentColor }" aria-hidden="true" />
        {{ templateName }} <span class="chip-action">· {{ t('preview.change') }}</span>
      </button>
      <div v-if="!isCompact" class="zoom" role="group" aria-label="Zoom">
        <button type="button" class="zoom-btn" :aria-label="t('preview.zoomOut')" :disabled="zoom <= ZOOM_MIN" @click="zoomBy(-ZOOM_STEP)">−</button>
        <output class="zoom-value" aria-live="polite">{{ zoomPercent }} %</output>
        <button type="button" class="zoom-btn" :aria-label="t('preview.zoomIn')" :disabled="zoom >= ZOOM_MAX" @click="zoomBy(ZOOM_STEP)">+</button>
        <button type="button" class="fit" :aria-label="t('preview.fitLabel')" @click="fitToPanel">{{ t('preview.fit') }}</button>
      </div>
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
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5em 1em;
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
  gap: 0.25em;
  font-size: 0.8em;
  color: var(--text-muted);
}

.chip {
  display: flex;
  align-items: center;
  gap: 0.5em;
  min-height: 34px;
  padding: 0 0.7em;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-size: 0.85em;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}

.chip:hover {
  background: var(--surface-2);
}

.chip-action {
  font-weight: 500;
  color: var(--text-muted);
}

/* Narrow desktop column: the template name alone still says what the button does (its label does). */
@media (max-width: 1279px) {
  .chip-action {
    display: none;
  }
}

.swatch {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.zoom-btn,
.fit {
  min-width: 32px;
  min-height: 32px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--text);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.zoom-btn {
  font-size: 1.1em;
}

.zoom-btn:hover:not(:disabled) {
  background: var(--surface-2);
}

.zoom-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.fit {
  padding: 0 0.6em;
  background: var(--surface-2);
  font-size: 0.85em;
}

.zoom-value {
  min-width: 3.5em;
  text-align: center;
  color: var(--text);
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
