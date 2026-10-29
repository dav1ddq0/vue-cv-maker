<script setup lang="ts">
/**
 * Start, end and "currently here" for a dated entry (experience, education). `end === null` is
 * "present"; the checkbox is the only way to express it (spec 028 shares what both steps repeated).
 */
import { useI18n } from '@/i18n'
import { useValidation } from '@/composables/useValidation'
import BaseField from '@/components/ui/BaseField.vue'
import MonthField from '@/components/ui/MonthField.vue'

const start = defineModel<string>('start', { required: true })
const end = defineModel<string | null>('end', { required: true })

const { t } = useI18n()
const { dateOrderWarning } = useValidation()

function onCurrentChange(event: Event) {
  end.value = (event.target as HTMLInputElement).checked ? null : ''
}
</script>

<template>
  <div class="dates">
    <BaseField v-slot="{ id }" :label="t('experience.start')">
      <MonthField :id="id" v-model="start" :label="t('experience.start')" />
    </BaseField>
    <BaseField
      v-slot="{ id }"
      :label="t('experience.end')"
      :warning="dateOrderWarning(start, end)"
      :disabled="end === null"
    >
      <MonthField :id="id" :model-value="end ?? ''" :label="t('experience.end')" :disabled="end === null" @update:model-value="end = $event" />
    </BaseField>
    <label class="current">
      <input type="checkbox" :checked="end === null" @change="onCurrentChange" />
      {{ t('experience.current') }}
    </label>
  </div>
</template>

<style scoped>
.dates {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.6em;
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
</style>
