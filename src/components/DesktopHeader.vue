<script setup lang="ts">
/**
 * Desktop header (spec 018). In the editor: where you are ("My CVs / <name>"), the save state in words,
 * undo / redo, Import, preferences and Export as the main action. Elsewhere: the three views.
 */
import { computed } from 'vue'
import { useCvStore } from '@/stores/cv'
import { useUiStore } from '@/stores/ui'
import { useI18n } from '@/i18n'
import PreferencesPopover from './PreferencesPopover.vue'

const emit = defineEmits<{ export: [] }>()

const cv = useCvStore()
const ui = useUiStore()
const { t } = useI18n()

const VIEWS = ['editor', 'documents', 'import'] as const

const saveText = computed(() => {
  switch (cv.saveState) {
    case 'saving':
      return t('header.saving')
    case 'saved':
      return t('header.saved')
    case 'error':
      return cv.saveError === 'quota' ? t('notices.quota') : t('notices.saveFailed')
    default:
      return ''
  }
})
</script>

<template>
  <header class="header">
    <button type="button" class="brand" @click="ui.view = 'documents'">
      <span class="mark" aria-hidden="true">CV</span>{{ t('app.name') }}
    </button>

    <nav v-if="ui.view === 'editor'" class="crumbs" :aria-label="t('header.breadcrumb')">
      <button type="button" class="crumb" @click="ui.view = 'documents'">{{ t('nav.documents') }}</button>
      <span class="sep" aria-hidden="true">/</span>
      <input v-model="cv.data.meta.title" class="doc-title" :aria-label="t('header.docTitle')" :placeholder="t('documents.untitled')" />
      <span class="state" :class="{ 'state--error': cv.saveState === 'error' }" role="status">
        <span v-if="cv.saveState === 'saved'" class="dot" aria-hidden="true" />{{ saveText }}
      </span>
    </nav>
    <nav v-else class="views" :aria-label="t('nav.editor')">
      <button
        v-for="target in VIEWS"
        :key="target"
        type="button"
        class="view"
        :aria-current="ui.view === target ? 'page' : undefined"
        @click="ui.view = target"
      >
        {{ t(`nav.${target}`) }}
      </button>
    </nav>

    <span class="spacer" />

    <template v-if="ui.view === 'editor'">
      <button type="button" class="icon" :aria-label="t('header.undo')" :title="t('header.undo')" :disabled="!cv.canUndo" @click="cv.undo()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 14L4 9l5-5" /><path d="M4 9h10a6 6 0 010 12h-3" /></svg>
      </button>
      <button type="button" class="icon" :aria-label="t('header.redo')" :title="t('header.redo')" :disabled="!cv.canRedo" @click="cv.redo()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 14l5-5-5-5" /><path d="M20 9H10a6 6 0 000 12h3" /></svg>
      </button>
      <span class="divider" aria-hidden="true" />
      <button type="button" class="ghost" @click="ui.view = 'import'">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V4m0 0L8 8m4-4l4 4" /><path d="M4 15v4a1 1 0 001 1h14a1 1 0 001-1v-4" /></svg>
        {{ t('nav.import') }}
      </button>
    </template>

    <PreferencesPopover />

    <button v-if="ui.view === 'editor'" type="button" class="primary" aria-haspopup="dialog" @click="emit('export')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v12m0 0l-4-4m4 4l4-4" /><path d="M4 20h16" /></svg>
      {{ t('header.export') }}
    </button>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  gap: 0.75em;
  min-height: 56px;
  padding: 0 1em 0 1.25em;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.6em;
  padding: 0;
  border: 0;
  background: none;
  color: var(--text);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--accent);
  color: var(--on-accent);
  font-size: 0.72em;
}

.crumbs,
.views {
  display: flex;
  align-items: center;
  gap: 0.5em;
  min-width: 0;
  margin-left: 0.75em;
}

.crumb {
  padding: 0.4em 0.3em;
  border: 0;
  background: none;
  color: var(--text-muted);
  font: inherit;
  font-size: 0.9em;
  font-weight: 500;
  cursor: pointer;
}

.crumb:hover {
  color: var(--text);
}

.sep {
  color: var(--text-muted);
}

.doc-title {
  /* Grows with its text where supported; the max keeps a long name from pushing the actions out. */
  field-sizing: content;
  min-width: 6ch;
  max-width: 28ch;
  padding: 0.35em 0.5em;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--text);
  font: inherit;
  font-size: 0.9em;
  font-weight: 600;
}

.doc-title:hover {
  border-color: var(--border);
}

.state {
  display: flex;
  align-items: center;
  gap: 0.4em;
  font-size: 0.8em;
  color: var(--text-muted);
  white-space: nowrap;
}

.state--error {
  color: var(--danger);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #15803d;
}

.view {
  min-height: 40px;
  padding: 0 0.9em;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--text-muted);
  font: inherit;
  font-size: 0.9em;
  font-weight: 600;
  cursor: pointer;
}

.view[aria-current='page'] {
  background: var(--accent-soft);
  color: var(--text);
}

.spacer {
  flex: 1;
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--text);
  cursor: pointer;
}

.icon:hover:not(:disabled),
.ghost:hover {
  background: var(--surface-2);
}

.icon:disabled {
  opacity: 0.4;
  cursor: default;
}

.divider {
  width: 1px;
  height: 24px;
  background: var(--border);
}

.ghost,
.primary {
  display: flex;
  align-items: center;
  gap: 0.5em;
  min-height: 40px;
  padding: 0 0.9em;
  border-radius: 10px;
  font: inherit;
  font-size: 0.9em;
  font-weight: 600;
  cursor: pointer;
}

.ghost {
  border: 0;
  background: transparent;
  color: var(--text);
}

.primary {
  border: 0;
  background: var(--accent);
  color: var(--on-accent);
}
</style>
