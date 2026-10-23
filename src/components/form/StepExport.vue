<script setup lang="ts">
import { ref } from 'vue'
import { useCvStore } from '@/stores/cv'
import { useUiStore } from '@/stores/ui'
import { useI18n } from '@/i18n'
import { exportHtml, exportJson, printCv } from '@/services/export'
import BaseButton from '@/components/ui/BaseButton.vue'
import NoticeBar from '@/components/ui/NoticeBar.vue'
import PaginatedPreview from '@/components/preview/PaginatedPreview.vue'

const cv = useCvStore()
const ui = useUiStore()
const { t } = useI18n()

const busy = ref<'pdf' | 'html' | 'json' | null>(null)
const showPaginated = ref(false)

async function run(kind: 'pdf' | 'html' | 'json') {
  busy.value = kind
  try {
    // Autosave is debounced; flushing first means the file matches what is stored.
    await cv.flush()
    if (kind === 'pdf') await printCv(cv.data, ui.templateId, { paginate: true })
    else if (kind === 'html') await exportHtml(cv.data, ui.templateId)
    else await exportJson(cv.data)
  } finally {
    busy.value = null
  }
}
</script>

<template>
  <div class="step">
    <NoticeBar tone="warning">{{ t('notices.localOnly') }}</NoticeBar>

    <ul class="options">
      <li class="option">
        <div>
          <h3 class="option-title">{{ t('exportView.pdf') }}</h3>
          <p class="option-hint">{{ t('exportView.pdfHint') }}</p>
        </div>
        <BaseButton variant="primary" :disabled="busy !== null" @click="run('pdf')">
          {{ busy === 'pdf' ? t('exportView.preparing') : t('exportView.print') }}
        </BaseButton>
      </li>

      <li class="option">
        <div>
          <h3 class="option-title">{{ t('exportView.html') }}</h3>
          <p class="option-hint">{{ t('exportView.htmlHint') }}</p>
        </div>
        <BaseButton :disabled="busy !== null" @click="run('html')">
          {{ t('exportView.download') }}
        </BaseButton>
      </li>

      <li class="option">
        <div>
          <h3 class="option-title">{{ t('exportView.json') }}</h3>
          <p class="option-hint">{{ t('exportView.jsonHint') }}</p>
        </div>
        <BaseButton :disabled="busy !== null" @click="run('json')">
          {{ t('exportView.download') }}
        </BaseButton>
      </li>
    </ul>

    <section class="paginated">
      <div class="paginated-head">
        <div>
          <h3 class="option-title">{{ t('exportView.paginated') }}</h3>
          <p class="option-hint">{{ t('exportView.paginatedHint') }}</p>
        </div>
        <BaseButton size="sm" @click="showPaginated = !showPaginated">
          {{ showPaginated ? t('preview.hide') : t('preview.show') }}
        </BaseButton>
      </div>
      <!-- Mounted on demand: paged.js is a lazy chunk and a full re-render. -->
      <PaginatedPreview v-if="showPaginated" :data="cv.data" :template-id="ui.templateId" />
    </section>
  </div>
</template>

<style scoped>
.step {
  display: flex;
  flex-direction: column;
  gap: 1.2em;
}

.options {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6em;
}

.option,
.paginated-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1em;
  padding: 0.8em 1em;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.option-title {
  margin: 0;
  font-size: 0.95em;
  font-weight: 600;
}

.option-hint {
  margin: 0.15em 0 0;
  font-size: 0.82em;
  color: var(--text-muted);
}

.paginated {
  display: flex;
  flex-direction: column;
  gap: 0.6em;
}
</style>
