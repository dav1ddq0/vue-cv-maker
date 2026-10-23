<script setup lang="ts">
import { computed } from 'vue'
import { useCvStore } from '@/stores/cv'
import { useUiStore } from '@/stores/ui'
import { useI18n, type Locale } from '@/i18n'
import BaseButton from '@/components/ui/BaseButton.vue'

const cv = useCvStore()
const ui = useUiStore()
const { t, locale, availableLocales } = useI18n()

const saveLabel = computed(() => {
  switch (cv.saveState) {
    case 'saving':
      return '…'
    case 'saved':
      return '✓'
    case 'error':
      return cv.saveError === 'quota' ? t('notices.quota') : '⚠'
    default:
      return ''
  }
})
</script>

<template>
  <header class="header">
    <div class="brand">
      <strong>{{ t('app.name') }}</strong>
      <span class="tagline">{{ t('app.tagline') }}</span>
    </div>

    <nav class="views" :aria-label="t('nav.editor')">
      <button
        v-for="target in (['editor', 'documents', 'import'] as const)"
        :key="target"
        type="button"
        class="view-btn"
        :class="{ 'view-btn--active': ui.view === target }"
        @click="ui.view = target"
      >
        {{ t(`nav.${target}`) }}
      </button>
    </nav>

    <div class="tools">
      <span class="save" :class="{ 'save--error': cv.saveState === 'error' }">{{ saveLabel }}</span>

      <BaseButton size="sm" variant="ghost" :disabled="!cv.canUndo" @click="cv.undo()">
        ↶ <span class="tool-label">{{ t('actions.undo') }}</span>
      </BaseButton>
      <BaseButton size="sm" variant="ghost" :disabled="!cv.canRedo" @click="cv.redo()">
        ↷ <span class="tool-label">{{ t('actions.redo') }}</span>
      </BaseButton>

      <select v-model="locale" class="select" :aria-label="t('nav.language')">
        <option v-for="code in availableLocales" :key="code" :value="code">
          {{ (code as Locale).toUpperCase() }}
        </option>
      </select>

      <BaseButton
        size="sm"
        variant="ghost"
        :aria-label="t('nav.theme')"
        @click="ui.setTheme(ui.theme === 'dark' ? 'light' : 'dark')"
      >
        {{ ui.theme === 'dark' ? '☀' : '☾' }}
      </BaseButton>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1em;
  flex-wrap: wrap;
  padding: 0.55em 1em;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}

.brand {
  display: flex;
  align-items: baseline;
  gap: 0.6em;
}

.tagline {
  font-size: 0.76em;
  color: var(--text-muted);
}

.views {
  display: flex;
  gap: 0.2em;
}

.view-btn {
  border: 0;
  background: transparent;
  color: var(--text-muted);
  padding: 0.35em 0.7em;
  border-radius: var(--radius-sm);
  font-size: 0.9em;
}

.view-btn:hover {
  background: var(--surface-2);
  color: var(--text);
}

.view-btn--active {
  background: var(--accent-soft);
  color: var(--text);
  font-weight: 600;
}

.tools {
  display: flex;
  align-items: center;
  gap: 0.2em;
}

.save {
  font-size: 0.8em;
  color: var(--text-muted);
  min-width: 1.2em;
  text-align: center;
}

.save--error {
  color: var(--danger);
}

.select {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  padding: 0.25em 0.4em;
  font-size: 0.82em;
}

@media (max-width: 900px) {
  .tagline,
  .tool-label {
    display: none;
  }
}
</style>
