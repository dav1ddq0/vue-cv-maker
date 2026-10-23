<script setup lang="ts">
import { useCvStore } from '@/stores/cv'
import { useI18n } from '@/i18n'
import { createSkillGroup } from '@/core/factory'
import type { SkillGroup } from '@/types/cv'
import BaseField from '@/components/ui/BaseField.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import SortableList from '@/components/ui/SortableList.vue'
import TagInput from '@/components/ui/TagInput.vue'

const cv = useCvStore()
const { t } = useI18n()

/** Edits names only; a skill that keeps its name keeps its level. */
function setNames(group: SkillGroup, names: string[]) {
  const byName = new Map(group.items.map((item) => [item.name, item]))
  group.items = names.map((name) => byName.get(name) ?? { name })
}
</script>

<template>
  <div class="step">
    <p v-if="!cv.data.skills.length" class="empty">{{ t('skills.empty') }}</p>

    <SortableList :items="cv.data.skills" @reorder="cv.data.skills = $event">
      <template #default="{ item, index }">
        <div class="entry">
          <BaseField v-slot="{ id }" :label="t('skills.category')" :hint="t('skills.categoryHint')">
            <input :id="id" v-model="item.category" />
          </BaseField>
          <BaseField v-slot="{ id }" :label="t('skills.items')" :hint="t('skills.itemsHint')">
            <TagInput
              :id="id"
              :model-value="item.items.map((skill) => skill.name)"
              @update:model-value="setNames(item, $event)"
            />
          </BaseField>
          <div class="actions">
            <BaseButton size="sm" variant="danger" @click="cv.data.skills.splice(index, 1)">
              {{ t('actions.remove') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </SortableList>

    <BaseButton variant="primary" @click="cv.data.skills.push(createSkillGroup())">
      + {{ t('skills.add') }}
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
  gap: 0.6em;
}

.actions {
  display: flex;
  justify-content: flex-end;
}
</style>
