<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import { useCvStore } from '@/stores/cv'
import { useI18n } from '@/i18n'
import { useValidation } from '@/composables/useValidation'
import { useCapabilities } from '@/composables/useCapabilities'
import { createLink } from '@/core/factory'
import { deletePhoto, loadPhoto, savePhoto, StorageQuotaError } from '@/services/storage'
import BaseField from '@/components/ui/BaseField.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import SortableList from '@/components/ui/SortableList.vue'

const cv = useCvStore()
const { t } = useI18n()
const { emailWarning, urlWarning } = useValidation()
const { supports, reasonFor } = useCapabilities()

const photoSupported = supports('photo')
const photoReason = reasonFor('photo')
const photoError = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const thumbUrl = ref<string | null>(null)

let thumbRequest = 0

/** The stored reference is stable per CV, so the thumbnail is also refreshed by hand after an upload. */
async function refreshThumb() {
  const request = ++thumbRequest
  const reference = cv.data.personal.photo
  let url: string | null = null
  if (reference?.startsWith('photo:')) {
    try {
      const blob = await loadPhoto(reference)
      if (blob) url = URL.createObjectURL(blob)
    } catch {
      // The thumbnail is only a convenience; a failed read must not look like a failed upload.
    }
  }
  if (request !== thumbRequest) {
    if (url) URL.revokeObjectURL(url)
    return
  }
  if (thumbUrl.value) URL.revokeObjectURL(thumbUrl.value)
  thumbUrl.value = url
}

function revokeThumb() {
  thumbRequest++
  if (thumbUrl.value) URL.revokeObjectURL(thumbUrl.value)
  thumbUrl.value = null
}

watch(() => cv.data.personal.photo, refreshThumb, { immediate: true })
onUnmounted(revokeThumb)

async function onPhotoPicked(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  photoError.value = null
  try {
    cv.data.personal.photo = await savePhoto(cv.data.meta.id, file)
    await refreshThumb()
  } catch (error) {
    photoError.value = error instanceof StorageQuotaError ? t('notices.quota') : t('importView.parseError')
  }
}

async function removePhoto() {
  const reference = cv.data.personal.photo
  cv.data.personal.photo = undefined
  if (fileInput.value) fileInput.value.value = ''
  if (reference) await deletePhoto(reference)
}
</script>

<template>
  <div class="step">
    <div class="grid">
      <BaseField v-slot="{ id }" :label="t('personal.fullName')">
        <input :id="id" v-model="cv.data.personal.fullName" autocomplete="name" />
      </BaseField>

      <BaseField v-slot="{ id }" :label="t('personal.headline')" :hint="t('personal.headlineHint')">
        <input :id="id" v-model="cv.data.personal.headline" />
      </BaseField>

      <BaseField
        v-slot="{ id }"
        :label="t('personal.email')"
        :warning="emailWarning(cv.data.personal.email)"
      >
        <input :id="id" v-model="cv.data.personal.email" type="email" autocomplete="email" />
      </BaseField>

      <BaseField v-slot="{ id }" :label="t('personal.phone')">
        <input :id="id" v-model="cv.data.personal.phone" type="tel" autocomplete="tel" />
      </BaseField>

      <BaseField v-slot="{ id }" :label="t('personal.location')">
        <input :id="id" v-model="cv.data.personal.location" />
      </BaseField>

      <BaseField
        v-slot="{ id }"
        :label="t('personal.photo')"
        :disabled="!photoSupported"
        :disabled-reason="photoReason"
        :warning="photoError ?? undefined"
      >
        <div class="photo-row">
          <img v-if="thumbUrl" class="thumb" :src="thumbUrl" alt="" />
          <input
            :id="id"
            ref="fileInput"
            type="file"
            accept="image/*"
            :disabled="!photoSupported"
            @change="onPhotoPicked"
          />
          <BaseButton
            v-if="cv.data.personal.photo"
            size="sm"
            variant="danger"
            @click="removePhoto"
          >
            {{ t('personal.photoRemove') }}
          </BaseButton>
        </div>
      </BaseField>
    </div>

    <section class="links">
      <h3 class="subtitle">{{ t('personal.links') }}</h3>
      <SortableList
        :items="cv.data.personal.links"
        @reorder="cv.data.personal.links = $event"
      >
        <template #default="{ item, index }">
          <div class="link-row">
            <BaseField v-slot="{ id }" :label="t('personal.linkLabel')">
              <input :id="id" v-model="item.label" />
            </BaseField>
            <BaseField v-slot="{ id }" :label="t('personal.linkUrl')" :warning="urlWarning(item.url)">
              <input :id="id" v-model="item.url" inputmode="url" />
            </BaseField>
            <BaseButton
              size="sm"
              variant="danger"
              @click="cv.data.personal.links.splice(index, 1)"
            >
              {{ t('actions.remove') }}
            </BaseButton>
          </div>
        </template>
      </SortableList>

      <BaseButton size="sm" @click="cv.data.personal.links.push(createLink())">
        + {{ t('personal.addLink') }}
      </BaseButton>
    </section>
  </div>
</template>

<style scoped>
.step {
  display: flex;
  flex-direction: column;
  gap: 1.4em;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 0.9em;
}

.photo-row {
  display: flex;
  align-items: center;
  gap: 0.5em;
  flex-wrap: wrap;
}

.thumb {
  width: 3.2em;
  height: 3.2em;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border);
}
.photo-row input[type='file'] {
  border: 0 !important;
  padding: 0 !important;
  font-size: 0.85em;
}

.links {
  display: flex;
  flex-direction: column;
  gap: 0.7em;
  align-items: flex-start;
}

.subtitle {
  margin: 0;
  font-size: 0.95em;
  font-weight: 600;
}

.link-row {
  display: grid;
  grid-template-columns: 1fr 1.6fr auto;
  gap: 0.6em;
  align-items: end;
}

@media (max-width: 640px) {
  .link-row {
    grid-template-columns: 1fr;
  }
}
</style>
