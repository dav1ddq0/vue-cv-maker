<script setup lang="ts">
/** Custom sections plus the render order of *all* sections (spec §3, §11 phase 4). */
import { computed } from 'vue'
import { useCvStore } from '@/stores/cv'
import { useI18n } from '@/i18n'
import { createCustomEntry, createCustomSection } from '@/core/factory'
import { reconcileOrder } from '@/core/migrations'
import { SECTION_PRESET_IDS, createSectionFromPreset } from '@/core/sectionPresets'
import type { CustomSection } from '@/types/cv'
import BaseField from '@/components/ui/BaseField.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import SortableList from '@/components/ui/SortableList.vue'

const cv = useCvStore()
const { t } = useI18n()

/** `sectionOrder` holds bare ids; the list needs objects with a label. */
const orderItems = computed(() =>
  cv.data.sectionOrder.map((id) => ({
    id,
    label:
      cv.data.customSections.find((section) => section.id === id)?.title ||
      (isBuiltin(id) ? t(`steps.${id}`) : t('custom.title')),
  })),
)

const BUILTIN = ['summary', 'experience', 'education', 'skills', 'languages']
const isBuiltin = (id: string) => BUILTIN.includes(id)

function addSection(section: CustomSection = createCustomSection('')) {
  cv.data.customSections.push(section)
  cv.data.sectionOrder = reconcileOrder(cv.data.sectionOrder, cv.data)
}

function addPreset(id: (typeof SECTION_PRESET_IDS)[number]) {
  addSection(createSectionFromPreset(id, cv.data.meta.language || 'es'))
}

function removeSection(index: number) {
  const [removed] = cv.data.customSections.splice(index, 1)
  cv.data.sectionOrder = cv.data.sectionOrder.filter((id) => id !== removed.id)
}
</script>

<template>
  <div class="step">
    <section class="block">
      <p v-if="!cv.data.customSections.length" class="empty">{{ t('custom.empty') }}</p>

      <SortableList :items="cv.data.customSections" @reorder="cv.data.customSections = $event">
        <template #default="{ item, index }">
          <div class="section">
            <div class="section-head">
              <BaseField v-slot="{ id }" :label="t('custom.title')" :hint="t('custom.titleHint')">
                <input :id="id" v-model="item.title" />
              </BaseField>
              <BaseButton size="sm" variant="danger" @click="removeSection(index)">
                {{ t('actions.remove') }}
              </BaseButton>
            </div>

            <SortableList :items="item.entries" @reorder="item.entries = $event">
              <template #default="{ item: entry, index: entryIndex }">
                <div class="entry">
                  <div class="row">
                    <BaseField v-slot="{ id }" :label="t('custom.entryTitle')">
                      <input :id="id" v-model="entry.title" />
                    </BaseField>
                    <BaseField v-slot="{ id }" :label="t('custom.entrySubtitle')">
                      <input :id="id" v-model="entry.subtitle" />
                    </BaseField>
                    <BaseField v-slot="{ id }" :label="t('custom.entryDate')">
                      <input :id="id" v-model="entry.date" />
                    </BaseField>
                  </div>
                  <BaseField v-slot="{ id }" :label="t('custom.entryDescription')">
                    <textarea :id="id" v-model="entry.description" rows="2" />
                  </BaseField>
                  <div class="actions">
                    <BaseButton size="sm" variant="danger" @click="item.entries.splice(entryIndex, 1)">
                      {{ t('actions.remove') }}
                    </BaseButton>
                  </div>
                </div>
              </template>
            </SortableList>

            <BaseButton size="sm" @click="item.entries.push(createCustomEntry())">
              + {{ t('custom.addEntry') }}
            </BaseButton>
          </div>
        </template>
      </SortableList>

      <div class="picker" role="group" :aria-label="t('custom.pick')">
        <h3 class="subtitle">{{ t('custom.pick') }}</h3>
        <div class="chips">
          <BaseButton v-for="id in SECTION_PRESET_IDS" :key="id" size="sm" @click="addPreset(id)">
            + {{ t(`custom.presets.${id}`) }}
          </BaseButton>
          <BaseButton size="sm" variant="primary" @click="addSection()">+ {{ t('custom.blank') }}</BaseButton>
        </div>
      </div>
    </section>

    <section class="block">
      <h3 class="subtitle">{{ t('custom.order') }}</h3>
      <SortableList
        :items="orderItems"
        @reorder="cv.data.sectionOrder = $event.map((entry) => entry.id)"
      >
        <template #default="{ item }">
          <span class="order-label">{{ item.label }}</span>
        </template>
      </SortableList>
    </section>
  </div>
</template>

<style scoped>
.step {
  display: flex;
  flex-direction: column;
  gap: 1.6em;
}

.block {
  display: flex;
  flex-direction: column;
  gap: 0.8em;
  align-items: flex-start;
}

.block > :deep(.list) {
  width: 100%;
}

.subtitle {
  margin: 0;
  font-size: 0.95em;
  font-weight: 600;
}

.empty {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.9em;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 0.7em;
  align-items: flex-start;
  width: 100%;
}

.section-head {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.6em;
  align-items: end;
  width: 100%;
}

.entry {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.5em;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.picker {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4em;
}

.order-label {
  font-weight: 550;
}
</style>
