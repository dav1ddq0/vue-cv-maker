<script setup lang="ts">
import { useCvStore } from '@/stores/cv'
import { useI18n } from '@/i18n'
import { useValidation } from '@/composables/useValidation'
import { createEducation } from '@/core/factory'
import BaseField from '@/components/ui/BaseField.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import SortableList from '@/components/ui/SortableList.vue'
import type { EducationEntry } from '@/types/cv'

const cv = useCvStore()
const { t } = useI18n()
const { dateOrderWarning } = useValidation()

function toggleCurrent(entry: EducationEntry, current: boolean) {
  entry.endDate = current ? null : ''
}
</script>

<template>
  <div class="step">
    <p v-if="!cv.data.education.length" class="empty">{{ t('education.empty') }}</p>

    <SortableList :items="cv.data.education" @reorder="cv.data.education = $event">
      <template #default="{ item, index }">
        <div class="entry">
          <div class="row">
            <BaseField v-slot="{ id }" :label="t('education.degree')">
              <input :id="id" v-model="item.degree" />
            </BaseField>
            <BaseField v-slot="{ id }" :label="t('education.institution')">
              <input :id="id" v-model="item.institution" />
            </BaseField>
            <BaseField v-slot="{ id }" :label="t('experience.location')">
              <input :id="id" v-model="item.location" />
            </BaseField>
          </div>

          <div class="row dates">
            <BaseField v-slot="{ id }" :label="t('experience.start')">
              <input :id="id" v-model="item.startDate" type="month" />
            </BaseField>
            <BaseField
              v-slot="{ id }"
              :label="t('experience.end')"
              :warning="dateOrderWarning(item.startDate, item.endDate)"
              :disabled="item.endDate === null"
            >
              <input
                :id="id"
                :value="item.endDate ?? ''"
                type="month"
                :disabled="item.endDate === null"
                @input="item.endDate = ($event.target as HTMLInputElement).value"
              />
            </BaseField>
            <label class="current">
              <input
                type="checkbox"
                :checked="item.endDate === null"
                @change="toggleCurrent(item, ($event.target as HTMLInputElement).checked)"
              />
              {{ t('experience.current') }}
            </label>
          </div>

          <BaseField v-slot="{ id }" :label="t('experience.description')">
            <textarea :id="id" v-model="item.description" rows="2" />
          </BaseField>

          <div class="actions">
            <BaseButton size="sm" variant="danger" @click="cv.data.education.splice(index, 1)">
              {{ t('actions.remove') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </SortableList>

    <BaseButton variant="primary" @click="cv.data.education.push(createEducation())">
      + {{ t('education.add') }}
    </BaseButton>
  </div>
</template>

<style scoped>
.step {
  display: flex;
  flex-direction: column;
  gap: 1em;
  align-items: flex-start;
}

.step > :deep(.list) {
  width: 100%;
}

.empty {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.9em;
}

.entry {
  display: flex;
  flex-direction: column;
  gap: 0.7em;
}

.row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 0.6em;
}

.dates {
  align-items: end;
}

.current {
  display: flex;
  align-items: center;
  gap: 0.4em;
  font-size: 0.85em;
  color: var(--text-muted);
  padding-bottom: 0.55em;
}

.actions {
  display: flex;
  justify-content: flex-end;
}
</style>
