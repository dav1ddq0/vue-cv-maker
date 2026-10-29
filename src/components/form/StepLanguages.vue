<script setup lang="ts">
import { useCvStore } from '@/stores/cv'
import { useI18n } from '@/i18n'
import { createLanguage } from '@/core/factory'
import BaseField from '@/components/ui/BaseField.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import SortableList from '@/components/ui/SortableList.vue'
import LanguageLevelPicker from './LanguageLevelPicker.vue'

const cv = useCvStore()
const { t } = useI18n()
</script>

<template>
  <div class="step">
    <p v-if="!cv.data.languages.length" class="empty">{{ t('languages.empty') }}</p>

    <SortableList :items="cv.data.languages" @reorder="cv.data.languages = $event">
      <template #default="{ item, index }">
        <div class="row">
          <BaseField v-slot="{ id }" :label="t('languages.name')">
            <input :id="id" v-model="item.name" />
          </BaseField>
          <BaseField v-slot="{ id }" :label="t('languages.level')">
            <input :id="id" v-model="item.level" list="cv-language-levels" />
          </BaseField>
          <BaseButton size="sm" variant="danger" :aria-label="item.name ? t('actions.removeNamed', { name: item.name }) : undefined" @click="cv.data.languages.splice(index, 1)">
            {{ t('actions.remove') }}
          </BaseButton>
          <LanguageLevelPicker
            v-model="item.level"
            class="levels"
            :cv-language="cv.data.meta.language"
            :label="t('languages.quickLevel', { name: item.name || t('languages.name') })"
          />
        </div>
      </template>
    </SortableList>

    <p v-if="cv.data.languages.length" class="help">{{ t('languages.levelHelp') }}</p>

    <datalist id="cv-language-levels">
      <option v-for="level in ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']" :key="level" :value="level" />
    </datalist>

    <BaseButton variant="primary" @click="cv.data.languages.push(createLanguage())">
      + {{ t('languages.add') }}
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
  font-size: var(--size-14);
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 0.6em;
  align-items: end;
}

.levels {
  grid-column: 1 / -1;
}

.help {
  margin: 0;
  font-size: var(--size-12);
  color: var(--text-muted);
}

@media (max-width: 640px) {
  .row {
    grid-template-columns: 1fr;
  }
}
</style>
