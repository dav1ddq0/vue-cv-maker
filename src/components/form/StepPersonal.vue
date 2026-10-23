<script setup lang="ts">
import { ref } from 'vue'
import { useCvStore } from '@/stores/cv'
import { useI18n } from '@/i18n'
import { useValidation } from '@/composables/useValidation'
import { useCapabilities } from '@/composables/useCapabilities'
import { usePhotoThumb } from '@/composables/usePhotoThumb'
import { createLink } from '@/core/factory'
import { deletePhoto, savePhoto, StorageQuotaError } from '@/services/storage'
import BaseField from '@/components/ui/BaseField.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import FileDropzone from '@/components/import/FileDropzone.vue'
import SortableList from '@/components/ui/SortableList.vue'

const cv = useCvStore()
const { t } = useI18n()
const { emailWarning, urlWarning } = useValidation()
const { supports, reasonFor } = useCapabilities()

const photoSupported = supports('photo')
const photoReason = reasonFor('photo')
const photoError = ref<string | null>(null)
const { thumbUrl, refresh: refreshThumb } = usePhotoThumb(() => cv.data.personal.photo)

async function onPhoto(file: File) {
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
          <span v-else class="thumb thumb--empty" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="55%" height="55%" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="8" r="3.6" />
              <path d="M5 20c.6-3.6 3.4-5.6 7-5.6s6.4 2 7 5.6" />
            </svg>
          </span>
          <FileDropzone
            class="photo-drop"
            :input-id="id"
            compact
            accept="image/*"
            :disabled="!photoSupported"
            :hint="t('personal.photoHint')"
            @file="onPhoto"
          >
            {{ cv.data.personal.photo ? t('personal.photoReplace') : t('personal.photoDrop') }}
          </FileDropzone>
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
  gap: 0.7em;
  flex-wrap: wrap;
}

.thumb {
  flex: none;
  width: 3.6em;
  height: 3.6em;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border);
}

.thumb--empty {
  display: grid;
  place-items: center;
  color: var(--text-muted);
  background: var(--surface-2);
}

.photo-drop {
  flex: 1 1 14em;
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
