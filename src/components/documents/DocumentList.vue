<script setup lang="ts">
/** Multi-CV management (spec §8.2, phase 4). */
import { ref } from 'vue'
import { useCvStore } from '@/stores/cv'
import { useUiStore } from '@/stores/ui'
import { formatDate, useI18n } from '@/i18n'
import { createSampleCV } from '@/core/sample'
import BaseButton from '@/components/ui/BaseButton.vue'
import NoticeBar from '@/components/ui/NoticeBar.vue'

const cv = useCvStore()
const ui = useUiStore()
const { t } = useI18n()

const pendingDelete = ref<string | null>(null)

async function open(id: string) {
  await cv.open(id)
  ui.view = 'editor'
}

async function loadSample() {
  await cv.createNew({ seed: createSampleCV() })
  ui.goTo('personal')
}

async function confirmDelete(id: string) {
  await cv.remove(id)
  pendingDelete.value = null
}
</script>

<template>
  <section class="documents">
    <header class="head">
      <h2 class="title">{{ t('documents.title') }}</h2>
      <div class="head-actions">
        <BaseButton @click="loadSample">{{ t('actions.loadSample') }}</BaseButton>
        <BaseButton variant="primary" @click="cv.createNew().then(() => ui.goTo('personal'))">
          + {{ t('actions.newCv') }}
        </BaseButton>
      </div>
    </header>

    <NoticeBar tone="warning">{{ t('notices.localOnly') }}</NoticeBar>

    <p v-if="!cv.documents.length" class="empty">{{ t('documents.empty') }}</p>

    <ul v-else class="list">
      <li v-for="doc in cv.documents" :key="doc.id" class="item" :class="{ 'item--active': doc.id === cv.data.meta.id }">
        <div class="info">
          <p class="name">{{ doc.fullName || doc.title || t('documents.untitled') }}</p>
          <p class="meta">{{ doc.title }} · {{ t('documents.updated', { date: formatDate(doc.updatedAt) }) }}</p>
        </div>

        <div v-if="pendingDelete === doc.id" class="confirm">
          <span class="confirm-text">{{ t('documents.deleteConfirm', { title: doc.title }) }}</span>
          <BaseButton size="sm" @click="pendingDelete = null">{{ t('actions.cancel') }}</BaseButton>
          <BaseButton size="sm" variant="danger" @click="confirmDelete(doc.id)">
            {{ t('actions.confirm') }}
          </BaseButton>
        </div>

        <div v-else class="actions">
          <BaseButton size="sm" @click="open(doc.id)">{{ t('actions.open') }}</BaseButton>
          <BaseButton size="sm" @click="cv.duplicate(doc.id)">{{ t('actions.duplicate') }}</BaseButton>
          <BaseButton size="sm" variant="danger" @click="pendingDelete = doc.id">
            {{ t('actions.remove') }}
          </BaseButton>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.documents {
  display: flex;
  flex-direction: column;
  gap: 1em;
  padding: 1.4em;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1em;
  flex-wrap: wrap;
}

.head-actions {
  display: flex;
  gap: 0.5em;
}

.title {
  margin: 0;
  font-size: 1.3em;
}

.empty {
  color: var(--text-muted);
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6em;
}

.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1em;
  flex-wrap: wrap;
  padding: 0.8em 1em;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.item--active {
  border-color: var(--accent);
}

.name {
  margin: 0;
  font-weight: 600;
}

.meta {
  margin: 0.1em 0 0;
  font-size: 0.8em;
  color: var(--text-muted);
}

.actions,
.confirm {
  display: flex;
  align-items: center;
  gap: 0.4em;
  flex-wrap: wrap;
}

.confirm-text {
  font-size: 0.85em;
  color: var(--text-muted);
}
</style>
