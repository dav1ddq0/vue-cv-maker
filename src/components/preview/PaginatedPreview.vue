<script setup lang="ts">
/**
 * Faithful pagination preview (spec §6) without opening the print dialog.
 *
 * The container is deliberately empty from Vue's point of view: it is filled
 * imperatively and paged.js rewrites it freely. Vue never diffs those nodes, so
 * the library's DOM surgery and Vue's reactivity cannot collide.
 */
import { onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import type { CVData } from '@/types/cv'
import { exportCss, paginateInto, renderTemplateHtml, resolvePhoto } from '@/services/export'
import { useI18n } from '@/i18n'
import { debounce } from '@/core/debounce'

const props = defineProps<{ data: CVData; templateId: string }>()
const { t } = useI18n()

const host = shallowRef<HTMLElement | null>(null)
const pages = ref(0)
const busy = ref(false)
const failed = ref(false)

let revokeCurrent: (() => void) | null = null
let run = 0

// Repagination is expensive (a full off-screen render plus paged.js), so it
// trails typing instead of following every keystroke.
const schedule = debounce(() => void repaginate(), 400)

watch([() => props.data, () => props.templateId, host], () => schedule(), {
  deep: true,
  immediate: true,
})

onBeforeUnmount(() => {
  schedule.cancel()
  revokeCurrent?.()
})

async function repaginate() {
  const container = host.value
  if (!container) return

  const token = ++run
  busy.value = true
  failed.value = false

  const { data, revoke } = await resolvePhoto(props.data, 'objectUrl')
  // A newer run started while we were awaiting: drop this one's work entirely.
  if (token !== run) {
    revoke()
    return
  }
  revokeCurrent?.()
  revokeCurrent = revoke

  try {
    const html = await renderTemplateHtml(data, props.templateId)
    if (token !== run) return
    container.innerHTML = ''
    const ok = await paginateInto(container, html, exportCss())
    if (token !== run) return
    failed.value = !ok
    // Showing the unpaginated page beats an empty panel: the user still sees
    // their CV, and the notice says the page breaks are the ones missing.
    if (!ok) {
      container.innerHTML = ''
      const page = document.createElement('div')
      page.className = 'cv-page'
      page.innerHTML = html
      container.appendChild(page)
    }
    pages.value = container.querySelectorAll('.pagedjs_page').length
  } finally {
    if (token === run) busy.value = false
  }
}
</script>

<template>
  <div class="paginated">
    <p class="status">
      <span v-if="busy">{{ t('exportView.preparing') }}</span>
      <span v-else-if="failed" class="failed">{{ t('exportView.paginatedFailed') }}</span>
      <span v-else-if="pages">{{ t('preview.page', { n: pages, total: pages }) }}</span>
    </p>
    <div ref="host" class="pages" />
  </div>
</template>

<style scoped>
.paginated {
  display: flex;
  flex-direction: column;
  gap: 0.6em;
}

.status {
  margin: 0;
  font-size: 0.82em;
  color: var(--text-muted);
  min-height: 1.2em;
}

.failed {
  color: var(--danger);
}

.pages {
  overflow: auto;
  max-height: 70vh;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.8em;
}

/* paged.js output is injected imperatively, so its styles need :deep. */
.pages :deep(.pagedjs_page) {
  background: #fff;
  box-shadow: 0 2px 12px rgba(16, 24, 40, 0.14);
  margin: 0 auto 1em;
}
</style>
