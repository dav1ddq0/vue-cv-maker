<script setup lang="ts">
import { computed } from 'vue'
import { useCvStore } from '@/stores/cv'
import { formatMonth, useI18n } from '@/i18n'
import { useValidation } from '@/composables/useValidation'
import { createExperience } from '@/core/factory'
import BaseField from '@/components/ui/BaseField.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import SortableList from '@/components/ui/SortableList.vue'
import EntryCard from '@/components/ui/EntryCard.vue'
import { useExpandedEntry } from '@/composables/useExpandedEntry'
import TagInput from '@/components/ui/TagInput.vue'
import type { ExperienceEntry } from '@/types/cv'

const cv = useCvStore()
const { t } = useI18n()
const { dateOrderWarning } = useValidation()

/** `endDate === null` is "present"; the checkbox is the only way to express it. */
function toggleCurrent(entry: ExperienceEntry, current: boolean) {
  entry.endDate = current ? null : ''
}

const { isOpen, toggle } = useExpandedEntry(computed(() => cv.data.experience))

/** The folded card says which entry it is: "Position · Company", "Mar 2022 – Present · Remote". */
function entryTitle(item: ExperienceEntry): string {
  return [item.position, item.company].filter(Boolean).join(' · ') || t('entry.newExperience')
}

function entrySubtitle(item: ExperienceEntry): string {
  const end = item.endDate === null ? t('entry.present') : formatMonth(item.endDate ?? '')
  const dates = [formatMonth(item.startDate), end].filter(Boolean).join(' – ')
  return [dates, item.location].filter(Boolean).join(' · ')
}
</script>

<template>
  <div class="step">
    <p v-if="!cv.data.experience.length" class="empty">{{ t('experience.empty') }}</p>

    <SortableList :items="cv.data.experience" @reorder="cv.data.experience = $event">
      <template #default="{ item, index }">
        <EntryCard
          :title="entryTitle(item)"
          :subtitle="entrySubtitle(item)"
          :open="isOpen(item.id)"
          @toggle="toggle(item.id)"
        >
          <div class="entry">
            <div class="row">
              <BaseField v-slot="{ id }" :label="t('experience.position')">
                <input :id="id" v-model="item.position" />
              </BaseField>
              <BaseField v-slot="{ id }" :label="t('experience.company')">
                <input :id="id" v-model="item.company" />
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
              <textarea :id="id" v-model="item.description" rows="3" />
            </BaseField>

            <BaseField
              v-slot="{ id }"
              :label="t('experience.highlights')"
              :hint="t('skills.itemsHint')"
            >
              <TagInput :id="id" v-model="item.highlights" :placeholder="t('experience.addHighlight')" />
            </BaseField>

            <div class="actions">
              <BaseButton size="sm" variant="danger" :aria-label="t('actions.removeNamed', { name: entryTitle(item) })" @click="cv.data.experience.splice(index, 1)">
                {{ t('actions.remove') }}
              </BaseButton>
            </div>
          </div>
        </EntryCard>
      </template>
    </SortableList>

    <BaseButton variant="primary" @click="cv.data.experience.push(createExperience())">
      + {{ t('experience.add') }}
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

.empty {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.9em;
}

.step > :deep(.list) {
  width: 100%;
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
