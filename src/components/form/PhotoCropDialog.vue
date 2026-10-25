<script setup lang="ts">
/**
 * Frames the photo before it is stored (spec 025): drag, wheel or arrow keys to move it, a slider or
 * `+`/`-` to zoom, a quarter-turn button. The preview canvas and the stored file are drawn by the same
 * `drawCrop`, so what the user frames is what gets saved. A modal native <dialog>, like ExportDialog.
 */
import { computed, nextTick, ref, shallowRef, useId, watch } from 'vue'
import { useI18n } from '@/i18n'
import { clampOffset, clampZoom, cropRect, ZOOM_MAX, ZOOM_MIN, type Offset } from '@/core/photoCrop'
import { decodePhoto, drawCrop, encodeCrop, rotate, sizeOf, type CropSource } from '@/services/photoCrop'

/** The photo to frame; the dialog is open while it is set. */
const props = defineProps<{ photo: Blob | null }>()
const emit = defineEmits<{ confirm: [blob: Blob]; cancel: [] }>()

const { t } = useI18n()
const titleId = useId()
const zoomId = useId()

/** Frame side in geometry units; pointer moves are scaled from CSS pixels to these. */
const FRAME = 280
const KEY_STEP = 8
const ZOOM_STEP = 0.1

const dialog = ref<HTMLDialogElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const decoded = shallowRef<CropSource | null>(null)
const turns = ref(0)
const zoom = ref(1)
const offset = ref<Offset>({ x: 0, y: 0 })
const busy = ref(false)
const failed = ref(false)
let confirmed = false

const source = computed(() => (decoded.value ? rotate(decoded.value, turns.value) : null))

watch(
  () => props.photo,
  async (photo) => {
    if (!photo) {
      if (dialog.value?.open) dialog.value.close()
      return
    }
    confirmed = false
    failed.value = false
    decoded.value = null
    turns.value = 0
    zoom.value = 1
    offset.value = { x: 0, y: 0 }
    await nextTick()
    if (dialog.value && !dialog.value.open) dialog.value.showModal()
    try {
      decoded.value = await decodePhoto(photo)
    } catch {
      failed.value = true
    }
  },
  { flush: 'post' },
)

/** Every change repaints once per frame, however many pointer events arrive. */
let frameRequest = 0
watch([source, zoom, offset, canvas], () => {
  cancelAnimationFrame(frameRequest)
  frameRequest = requestAnimationFrame(paint)
})

function paint() {
  const el = canvas.value
  const image = source.value
  if (!el || !image) return
  const side = Math.round(FRAME * (window.devicePixelRatio || 1))
  if (el.width !== side) el.width = el.height = side
  drawCrop(el, image, cropRect(sizeOf(image), FRAME, zoom.value, offset.value))
}

function moveBy(dx: number, dy: number) {
  if (!source.value) return
  offset.value = clampOffset(sizeOf(source.value), FRAME, zoom.value, {
    x: offset.value.x + dx,
    y: offset.value.y + dy,
  })
}

function setZoom(next: number) {
  zoom.value = clampZoom(next)
  moveBy(0, 0)
}

/* ---- pointer: mouse, finger and pen alike ------------------------------ */

let dragging: { id: number; x: number; y: number } | null = null

function onPointerDown(event: PointerEvent) {
  dragging = { id: event.pointerId, x: event.clientX, y: event.clientY }
  ;(event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (!dragging || dragging.id !== event.pointerId) return
  const units = FRAME / ((event.currentTarget as HTMLElement).clientWidth || FRAME)
  moveBy((event.clientX - dragging.x) * units, (event.clientY - dragging.y) * units)
  dragging = { ...dragging, x: event.clientX, y: event.clientY }
}

function onPointerUp() {
  dragging = null
}

function onWheel(event: WheelEvent) {
  setZoom(zoom.value * Math.exp(-event.deltaY * 0.0015))
}

const KEYS: Record<string, () => void> = {
  ArrowLeft: () => moveBy(-KEY_STEP, 0),
  ArrowRight: () => moveBy(KEY_STEP, 0),
  ArrowUp: () => moveBy(0, -KEY_STEP),
  ArrowDown: () => moveBy(0, KEY_STEP),
  '+': () => setZoom(zoom.value + ZOOM_STEP),
  '=': () => setZoom(zoom.value + ZOOM_STEP),
  '-': () => setZoom(zoom.value - ZOOM_STEP),
}

function onKey(event: KeyboardEvent) {
  const action = KEYS[event.key]
  if (!action) return
  event.preventDefault()
  action()
}

function rotateQuarter() {
  turns.value = (turns.value + 1) % 4
  offset.value = { x: 0, y: 0 }
  moveBy(0, 0)
}

async function confirm() {
  const image = source.value
  if (!image) return
  busy.value = true
  try {
    const blob = await encodeCrop(image, cropRect(sizeOf(image), FRAME, zoom.value, offset.value))
    confirmed = true
    emit('confirm', blob)
  } catch {
    failed.value = true
  } finally {
    busy.value = false
  }
}

/** Esc, the close button and Cancel all end here; only a confirmed crop is not a cancel. */
function onClose() {
  if (!confirmed) emit('cancel')
}
</script>

<template>
  <dialog ref="dialog" class="crop" :aria-labelledby="titleId" @close="onClose">
    <h2 :id="titleId" class="title">{{ t('personal.crop.title') }}</h2>

    <p v-if="failed" class="failed" role="alert">{{ t('personal.crop.failed') }}</p>

    <div
      v-else
      class="frame"
      tabindex="0"
      role="group"
      :aria-label="t('personal.crop.frame')"
      :aria-busy="!source"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @wheel.prevent="onWheel"
      @keydown="onKey"
    >
      <canvas ref="canvas" class="canvas" aria-hidden="true" />
      <span class="guide" aria-hidden="true" />
    </div>
    <p class="hint">{{ t('personal.crop.hint') }}</p>

    <div class="controls">
      <label :for="zoomId" class="zoom-label">{{ t('personal.crop.zoom') }}</label>
      <input
        :id="zoomId"
        type="range"
        class="zoom"
        :min="ZOOM_MIN"
        :max="ZOOM_MAX"
        step="0.01"
        :value="zoom"
        :disabled="!source"
        @input="setZoom(Number(($event.target as HTMLInputElement).value))"
      />
      <button type="button" class="secondary" :disabled="!source" @click="rotateQuarter">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" /></svg>
        {{ t('personal.crop.rotate') }}
      </button>
    </div>

    <footer class="foot">
      <button type="button" class="secondary" @click="dialog?.close()">{{ t('actions.cancel') }}</button>
      <button type="button" class="primary" :disabled="!source || busy" @click="confirm">
        {{ t('personal.crop.use') }}
      </button>
    </footer>
  </dialog>
</template>

<style scoped>
.crop {
  width: min(400px, calc(100vw - 32px));
  padding: 1.3em 1.4em;
  border: 0;
  border-radius: 16px;
  background: var(--surface);
  color: var(--text);
  box-shadow: 0 24px 64px rgba(15, 23, 42, 0.28);
}

.crop[open] {
  display: flex;
  flex-direction: column;
  gap: 0.9em;
}

.crop::backdrop {
  background: rgba(15, 23, 42, 0.45);
}

.title {
  margin: 0;
  font-size: 1.1em;
}

.frame {
  position: relative;
  align-self: center;
  width: min(280px, 100%);
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: var(--radius-sm);
  background: var(--bg);
  cursor: grab;
  /* The page must not scroll or zoom while a finger moves the photo. */
  touch-action: none;
  user-select: none;
}

.frame:active {
  cursor: grabbing;
}

.frame:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 3px;
}

.canvas {
  display: block;
  width: 100%;
  height: 100%;
}

/* What the round templates keep: everything outside the circle is dimmed. */
.guide {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  box-shadow: 0 0 0 999px rgba(15, 23, 42, 0.35);
  outline: 1px solid rgba(255, 255, 255, 0.8);
  pointer-events: none;
}

.hint,
.failed {
  margin: 0;
  font-size: 0.85em;
  color: var(--text-muted);
}

.failed {
  color: var(--danger);
}

.controls {
  display: flex;
  align-items: center;
  gap: 0.7em;
}

.zoom-label {
  font-size: 0.9em;
  font-weight: 600;
}

.zoom {
  flex: 1;
  min-width: 0;
  accent-color: var(--accent);
}

.foot {
  display: flex;
  justify-content: flex-end;
  gap: 0.6em;
}

.primary,
.secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  min-height: 40px;
  padding: 0 1em;
  border-radius: var(--radius-sm);
  font-weight: 600;
  white-space: nowrap;
}

.primary {
  border: 0;
  background: var(--accent);
  color: var(--on-accent);
}

.secondary {
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
}

.primary:disabled,
.secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
