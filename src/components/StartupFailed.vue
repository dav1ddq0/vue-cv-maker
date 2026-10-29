<script setup lang="ts">
/**
 * What the app shows when the stored CVs could not be opened, or brought over from the app's old
 * name (spec 039): the reason and a way to try again, never an empty app. Presentation only; the
 * root decides when it shows and what reloading means.
 */
import { useI18n } from '@/i18n'
import BaseButton from '@/components/ui/BaseButton.vue'
import NoticeBar from '@/components/ui/NoticeBar.vue'

defineEmits<{ reload: [] }>()
const { t } = useI18n()
</script>

<template>
  <main class="scroll-view startup-failed">
    <NoticeBar tone="warning">{{ t('notices.startupFailed') }}</NoticeBar>
    <BaseButton variant="primary" @click="$emit('reload')">{{ t('notices.reload') }}</BaseButton>
  </main>
</template>

<style scoped>
.startup-failed {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
}
</style>
