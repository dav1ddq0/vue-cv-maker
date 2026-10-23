<script setup lang="ts">
import { defineAsyncComponent, onBeforeUnmount, onMounted } from 'vue'
import { useCvStore } from '@/stores/cv'
import { useUiStore } from '@/stores/ui'
import { useI18n } from '@/i18n'
import AppHeader from '@/components/AppHeader.vue'
import CvWizard from '@/components/form/CvWizard.vue'
import PreviewPane from '@/components/preview/PreviewPane.vue'
import DocumentList from '@/components/documents/DocumentList.vue'
import NoticeBar from '@/components/ui/NoticeBar.vue'

const cv = useCvStore()
const ui = useUiStore()
const { t } = useI18n()

// pdf.js is ~500 kB: the import view — and the parser behind it — load only when
// someone actually opens it, so the editor's first paint never pays for it.
const ImportView = defineAsyncComponent(() => import('@/components/import/ImportView.vue'))

onMounted(async () => {
  ui.setTheme(ui.theme)
  await ui.probeEnvironment()
  await cv.init()
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('beforeunload', flushPending)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('beforeunload', flushPending)
})

/** A debounced autosave must not be lost to a tab close. */
function flushPending() {
  void cv.flush()
}

function onKeydown(event: KeyboardEvent) {
  const mod = event.ctrlKey || event.metaKey
  if (!mod || event.key.toLowerCase() !== 'z') return
  // Don't hijack the browser's own undo inside a text field.
  const target = event.target as HTMLElement | null
  if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return
  event.preventDefault()
  if (event.shiftKey) cv.redo()
  else cv.undo()
}
</script>

<template>
  <div class="app">
    <AppHeader />

    <div v-if="!ui.storageAvailable || !ui.storagePersisted" class="notices">
      <NoticeBar v-if="!ui.storageAvailable" tone="warning">
        {{ t('notices.privateMode') }}
      </NoticeBar>
      <NoticeBar
        v-else-if="!ui.isDismissed('persistence')"
        tone="warning"
        dismissible
        @dismiss="ui.dismissNotice('persistence')"
      >
        {{ t('notices.notPersisted') }}
      </NoticeBar>
    </div>

    <main v-if="ui.view === 'editor'" class="editor" :class="{ 'editor--preview-open': ui.previewOpen }">
      <CvWizard class="editor-form" />
      <PreviewPane class="editor-preview" />
    </main>

    <main v-else-if="ui.view === 'documents'" class="scroll-view">
      <DocumentList />
    </main>

    <main v-else class="scroll-view">
      <ImportView />
    </main>

  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.notices {
  padding: 0.6em 1em 0;
  display: flex;
  flex-direction: column;
  gap: 0.4em;
}

.editor {
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  min-height: 0;
}

.editor-form,
.editor-preview {
  min-height: 0;
}

.scroll-view {
  flex: 1;
  overflow: auto;
  display: flex;
}

@media (max-width: 1000px) {
  .editor {
    grid-template-columns: 1fr;
  }

  .editor-preview {
    display: none;
  }

  .editor--preview-open .editor-form {
    display: none;
  }

  .editor--preview-open .editor-preview {
    display: flex;
  }
}
</style>
