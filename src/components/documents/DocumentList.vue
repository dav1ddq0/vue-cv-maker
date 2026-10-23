<script setup lang="ts">
/** Multi-CV management (spec §8.2, phase 4). */
import { ref } from 'vue'
import { useCvStore } from '@/stores/cv'
import { useUiStore } from '@/stores/ui'
import { formatDate, useI18n } from '@/i18n'
import { createSampleCV } from '@/core/sample'
import BaseButton from '@/components/ui/BaseButton.vue'
import NoticeBar from '@/components/ui/NoticeBar.vue'
import { useIsPhone } from '@/composables/useIsPhone'
import DocumentCard from './DocumentCard.vue'
import DocumentActionsSheet from './DocumentActionsSheet.vue'
import type { CVSummary } from '@/types/cv'

const cv = useCvStore()
const ui = useUiStore()
const { t } = useI18n()

const pendingDelete = ref<string | null>(null)
const isPhone = useIsPhone()
const menuDoc = ref<CVSummary | null>(null)

async function open(id: string) {
  await cv.open(id)
  ui.view = 'editor'
}

async function loadSample() {
  await cv.createNew({ seed: createSampleCV() })
  ui.goTo('personal')
}

async function createBlank() {
  await cv.createNew()
  ui.goTo('personal')
}

async function duplicateFromMenu(id: string) {
  await cv.duplicate(id)
  menuDoc.value = null
}

async function removeFromMenu(id: string) {
  await cv.remove(id)
  menuDoc.value = null
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
      <div v-if="!isPhone" class="head-actions">
        <BaseButton @click="loadSample">{{ t('actions.loadSample') }}</BaseButton>
        <BaseButton variant="primary" @click="cv.createNew().then(() => ui.goTo('personal'))">
          + {{ t('actions.newCv') }}
        </BaseButton>
      </div>
    </header>

    <NoticeBar tone="warning">{{ t('notices.localOnly') }}</NoticeBar>

    <p v-if="!cv.documents.length" class="empty">{{ t('documents.empty') }}</p>

    <ul v-else-if="isPhone" class="list list--cards">
      <DocumentCard
        v-for="doc in cv.documents"
        :key="doc.id"
        :doc="doc"
        :active="doc.id === cv.data.meta.id"
        @open="open(doc.id)"
        @menu="menuDoc = doc"
      />
    </ul>

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
    <div v-if="isPhone" class="bottom">
      <BaseButton variant="primary" class="big" @click="createBlank">+ {{ t('actions.newCv') }}</BaseButton>
      <div class="pair">
        <BaseButton class="big" @click="loadSample">{{ t('actions.loadSample') }}</BaseButton>
        <BaseButton class="big" @click="ui.view = 'import'">{{ t('nav.import') }}</BaseButton>
      </div>
    </div>

    <DocumentActionsSheet
      :open="menuDoc !== null"
      :doc="menuDoc"
      @close="menuDoc = null"
      @duplicate="duplicateFromMenu"
      @remove="removeFromMenu"
    />
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
  min-height: 100%;
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

.list--cards {
  flex: 1;
}

/* Phones: the create actions stay at the bottom edge, within the thumb's reach. */
.bottom {
  position: sticky;
  bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6em;
  margin: 0 -1.4em;
  padding: 0.8em 1.4em calc(1em + var(--safe-bottom));
  background: var(--bg);
}

.pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6em;
}

.big {
  min-height: 52px;
  justify-content: center;
  border-radius: 14px;
}

.confirm-text {
  font-size: 0.85em;
  color: var(--text-muted);
}
</style>
