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

watch(
  () => props.templateId,
  async (id) => {
    templateComponent.value = await getTemplate(id).component()
  },
  { immediate: true },
)

watch(
  () => props.data.personal.photo,
  async (reference) => {
    revokePhoto()
    if (!reference?.startsWith('photo:')) return
    const blob = await loadPhoto(reference)
    if (blob) photoUrl.value = URL.createObjectURL(blob)
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
