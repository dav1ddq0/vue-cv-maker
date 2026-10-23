<script setup lang="ts">
import { useI18n } from '@/i18n'
import BaseButton from './BaseButton.vue'

defineProps<{ tone?: 'info' | 'warning'; dismissible?: boolean }>()
const emit = defineEmits<{ dismiss: [] }>()
const { t } = useI18n()
</script>

<template>
  <div class="notice" :class="`notice--${tone ?? 'info'}`" role="status">
    <p class="text"><slot /></p>
    <BaseButton v-if="dismissible" variant="ghost" size="sm" @click="emit('dismiss')">
      {{ t('notices.dismiss') }}
    </BaseButton>
  </div>
</template>

<style scoped>
.notice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1em;
  padding: 0.6em 0.9em;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface-2);
  font-size: 0.88em;
}

.notice--warning {
  background: var(--warning-bg);
  border-color: var(--warning-border);
}

.text {
  margin: 0;
}

/* On phones the banner competes with the form for a very short viewport. */
@media (max-width: 640px) {
  .notice {
    gap: 0.5em;
    padding: 0.4em 0.6em;
    font-size: 0.82em;
    line-height: 1.35;
  }

  .notice :deep(button) {
    flex-shrink: 0;
  }
}
</style>
