<script setup lang="ts">
import { useCvStore } from '@/stores/cv'
import { useI18n } from '@/i18n'
import BaseField from '@/components/ui/BaseField.vue'

const cv = useCvStore()
const { t } = useI18n()
</script>

<template>
  <BaseField v-slot="{ id }" :label="t('summary.label')" :hint="t('summary.hint')">
    <textarea :id="id" v-model="cv.data.summary" rows="6" />
  </BaseField>
</template>
