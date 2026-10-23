<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import type { CVData } from '@/types/cv'
import { useCvStore } from '@/stores/cv'
import { useUiStore } from '@/stores/ui'
import { useI18n } from '@/i18n'
import { importJsonFile } from '@/services/export'
import { UnsupportedSchemaError } from '@/core/migrations'
import { analyze, extractDocument, type ImportDraft } from '@/services/pdfImport'
import BaseButton from '@/components/ui/BaseButton.vue'
import NoticeBar from '@/components/ui/NoticeBar.vue'
import FileDropzone from './FileDropzone.vue'
import PdfReview from './PdfReview.vue'

const cv = useCvStore()
const ui = useUiStore()
const { t } = useI18n()

const draft = shallowRef<ImportDraft | null>(null)
const busy = ref(false)
const error = ref<string | null>(null)

async function onJson(file: File) {
  error.value = null
  try {
    await cv.importData(await importJsonFile(file), 'new')
    ui.goTo('personal')
  } catch (cause) {
    error.value =
      cause instanceof UnsupportedSchemaError ? t('importView.schemaError') : t('importView.parseError')
  }
}

async function onPdf(file: File) {
  error.value = null
  draft.value = null
  busy.value = true
  try {
    const extracted = await extractDocument(file)
    if (!extracted.hasTextLayer) {
      error.value = t('importView.noText')
      return
    }
    draft.value = analyze(extracted)
  } catch {
    error.value = t('importView.parseError')
  } finally {
    busy.value = false
  }
}

async function apply(data: CVData, mode: 'new' | 'current') {
  await cv.importData(data, mode)
  draft.value = null
  ui.goTo('personal')
}
</script>

<template>
  <section class="import">
    <h2 class="title">{{ t('importView.title') }}</h2>

    <NoticeBar v-if="error" tone="warning">{{ error }}</NoticeBar>

    <template v-if="!draft">
      <article class="card">
        <h3 class="card-title">{{ t('importView.json') }}</h3>
        <p class="card-hint">{{ t('importView.jsonHint') }}</p>
        <FileDropzone accept=".json,application/json" hint="JSON" @file="onJson" />
      </article>

      <article class="card">
        <h3 class="card-title">{{ t('importView.pdf') }}</h3>
        <p class="card-hint">{{ t('importView.pdfHint') }}</p>
        <FileDropzone accept=".pdf,application/pdf" hint="PDF" :busy="busy" @file="onPdf">
          {{ busy ? t('importView.analyzing') : t('importView.dropzone') }}
        </FileDropzone>
      </article>
    </template>

    <template v-else>
      <PdfReview :draft="draft" @apply="apply" />
      <div class="cancel">
        <BaseButton variant="ghost" @click="draft = null">{{ t('actions.cancel') }}</BaseButton>
      </div>
    </template>
  </section>
</template>

<style scoped>
.import {
  display: flex;
  flex-direction: column;
  gap: 1em;
  padding: 1.4em;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.title {
  margin: 0;
  font-size: 1.3em;
}

.card {
  padding: 1em;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  display: flex;
  flex-direction: column;
  gap: 0.6em;
}

.card-title {
  margin: 0;
  font-size: 1em;
}

.card-hint {
  margin: 0;
  font-size: 0.85em;
  color: var(--text-muted);
}

.cancel {
  display: flex;
  justify-content: flex-start;
}
</style>
