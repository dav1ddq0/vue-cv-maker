<script setup lang="ts">
/**
 * Mounts the active template with the one prop it is allowed to receive.
 *
 * It also resolves `personal.photo` from its `photo:{id}` storage reference into
 * an object URL, so templates stay ignorant of IndexedDB. The URL is revoked on
 * every change and on unmount to avoid leaking blobs while the user types.
 */
import { computed, onUnmounted, ref, shallowRef, watch } from 'vue'
import type { Component } from 'vue'
import type { CVData } from '@/types/cv'
import { getTemplate } from '@/templates/registry'
import { loadPhoto } from '@/services/storage'

const props = defineProps<{ data: CVData; templateId: string }>()

const templateComponent = shallowRef<Component | null>(null)
const photoUrl = ref<string | null>(null)

// Each load is marked stale when the next one starts or the renderer unmounts: a slow, older template
// chunk or photo read resolving late must not replace the newer one (spec 028).
watch(
  () => props.templateId,
  async (id, _previous, onCleanup) => {
    let stale = false
    onCleanup(() => (stale = true))
    const component = await getTemplate(id).component()
    if (!stale) templateComponent.value = component
  },
  { immediate: true },
)

watch(
  () => props.data.personal.photo,
  async (reference, _previous, onCleanup) => {
    let stale = false
    onCleanup(() => (stale = true))
    revokePhoto()
    if (!reference?.startsWith('photo:')) return
    const blob = await loadPhoto(reference)
    if (!blob) return
    const url = URL.createObjectURL(blob)
    if (stale) URL.revokeObjectURL(url)
    else photoUrl.value = url
  },
  { immediate: true },
)

onUnmounted(revokePhoto)

function revokePhoto() {
  if (photoUrl.value) URL.revokeObjectURL(photoUrl.value)
  photoUrl.value = null
}

/**
 * A shallow copy with the photo swapped: templates must not mutate their prop,
 * and the store must not be polluted with a transient object URL.
 */
const renderData = computed<CVData>(() => ({
  ...props.data,
  personal: { ...props.data.personal, photo: photoUrl.value ?? undefined },
}))
</script>

<template>
  <component :is="templateComponent" v-if="templateComponent" :data="renderData" />
</template>
