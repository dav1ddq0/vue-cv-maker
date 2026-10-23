<script setup lang="ts">
/**
 * Stage 3 of PDF import (spec §7.2): nothing is ever applied silently.
 *
 * The draft is editable here, low-confidence detections are flagged, and every
 * unclassified block must be sent somewhere explicitly — the default is discard.
 */
import { computed, reactive, ref } from 'vue'
import type { BlockTarget, ImportDraft, ReviewDecisions } from '@/services/pdfImport'
import { assembleCV } from '@/services/pdfImport'
import type { CVData } from '@/types/cv'
import { useI18n } from '@/i18n'
import BaseField from '@/components/ui/BaseField.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import NoticeBar from '@/components/ui/NoticeBar.vue'

const props = defineProps<{ draft: ImportDraft }>()
const emit = defineEmits<{ apply: [cv: CVData, mode: 'new' | 'current'] }>()
const { t } = useI18n()

const TARGETS: BlockTarget[] = ['discard', 'summary', 'experience', 'education', 'skills', 'languages', 'custom']

/** Editable copy of the detected fields; the draft itself stays immutable. */
const fields = reactive({
  fullName: props.draft.fullName.value,
  headline: props.draft.headline.value,
  email: props.draft.email.value,
  phone: props.draft.phone.value,
  location: props.draft.location.value,
})

const blocks = reactive<Record<string, BlockTarget>>(
  Object.fromEntries(props.draft.unclassified.map((block) => [block.id, 'discard' as BlockTarget])),
)

const showRaw = ref(false)

const decisions = computed<ReviewDecisions>(() => ({
  personal: {
    fullName: fields.fullName,
    email: fields.email,
    phone: fields.phone,
    location: fields.location,
  },
  headline: fields.headline,
  blocks: { ...blocks },
}))

const counts = computed(() => ({
  experience: props.draft.sections.filter((s) => s.kind === 'experience').length,
  education: props.draft.sections.filter((s) => s.kind === 'education').length,
  skills: props.draft.sections.filter((s) => s.kind === 'skills').length,
}))

const lowConfidence = (key: 'fullName' | 'headline' | 'email' | 'phone' | 'location') =>
  props.draft[key].confidence === 'low' ? t('importView.lowConfidence') : undefined

function apply(mode: 'new' | 'current') {
  emit('apply', assembleCV(props.draft, decisions.value), mode)
}
</script>

<template>
  <div class="review">
    <header>
      <h3 class="title">{{ t('importView.reviewTitle') }}</h3>
      <p class="hint">{{ t('importView.reviewHint') }}</p>
    </header>

    <NoticeBar tone="warning">{{ t('notices.importIsAnAid') }}</NoticeBar>
    <NoticeBar v-if="draft.warnings.includes('multiColumn')" tone="warning">
      {{ t('importView.pdfHint') }}
    </NoticeBar>

    <section class="fields">
      <BaseField v-slot="{ id }" :label="t('personal.fullName')" :warning="lowConfidence('fullName')">
        <input :id="id" v-model="fields.fullName" />
      </BaseField>
      <BaseField v-slot="{ id }" :label="t('personal.headline')" :warning="lowConfidence('headline')">
        <input :id="id" v-model="fields.headline" />
      </BaseField>
      <BaseField v-slot="{ id }" :label="t('personal.email')" :warning="lowConfidence('email')">
        <input :id="id" v-model="fields.email" />
      </BaseField>
      <BaseField v-slot="{ id }" :label="t('personal.phone')" :warning="lowConfidence('phone')">
        <input :id="id" v-model="fields.phone" />
      </BaseField>
      <BaseField v-slot="{ id }" :label="t('personal.location')" :warning="lowConfidence('location')">
        <input :id="id" v-model="fields.location" />
      </BaseField>
    </section>

    <p class="detected">
      {{ t('steps.experience') }}: {{ counts.experience }} ·
      {{ t('steps.education') }}: {{ counts.education }} ·
      {{ t('steps.skills') }}: {{ counts.skills }} ·
      {{ t('personal.links') }}: {{ draft.links.length }}
    </p>

    <section v-if="draft.unclassified.length" class="blocks">
      <h4 class="subtitle">{{ t('importView.unclassified') }}</h4>
      <p class="hint">{{ t('importView.unclassifiedHint') }}</p>

      <article v-for="block in draft.unclassified" :key="block.id" class="block">
        <div class="block-body">
          <p v-if="block.heading" class="block-heading">{{ block.heading }}</p>
          <p v-for="(line, index) in block.lines.slice(0, 6)" :key="index" class="block-line">
            {{ line }}
          </p>
          <p v-if="block.lines.length > 6" class="block-more">+{{ block.lines.length - 6 }}</p>
        </div>
        <label class="assign">
          <span class="assign-label">{{ t('importView.assignTo') }}</span>
          <select v-model="blocks[block.id]">
            <option v-for="target in TARGETS" :key="target" :value="target">
              {{ target === 'discard' ? t('importView.discard') : target === 'custom' ? t('custom.add') : t(`steps.${target}`) }}
            </option>
          </select>
        </label>
      </article>
    </section>

    <section class="raw">
      <BaseButton size="sm" @click="showRaw = !showRaw">{{ t('importView.rawText') }}</BaseButton>
      <pre v-if="showRaw" class="raw-text">{{ draft.rawText }}</pre>
    </section>

    <footer class="footer">
      <BaseButton @click="apply('current')">{{ t('importView.applyToCurrent') }}</BaseButton>
      <BaseButton variant="primary" @click="apply('new')">{{ t('importView.apply') }}</BaseButton>
    </footer>
  </div>
</template>

<style scoped>
.review {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.title {
  margin: 0;
  font-size: 1.05em;
}

.hint {
  margin: 0.2em 0 0;
  font-size: 0.85em;
  color: var(--text-muted);
}

.subtitle {
  margin: 0;
  font-size: 0.95em;
}

.fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 0.8em;
}

.detected {
  margin: 0;
  font-size: 0.85em;
  color: var(--text-muted);
}

.blocks {
  display: flex;
  flex-direction: column;
  gap: 0.6em;
}

.block {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1em;
  align-items: start;
  padding: 0.7em 0.9em;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.block-heading {
  margin: 0 0 0.3em;
  font-weight: 650;
  font-size: 0.9em;
}

.block-line {
  margin: 0;
  font-size: 0.84em;
  color: var(--text-muted);
}

.block-more {
  margin: 0.2em 0 0;
  font-size: 0.78em;
  color: var(--text-muted);
}

.assign {
  display: flex;
  flex-direction: column;
  gap: 0.25em;
}

.assign-label {
  font-size: 0.76em;
  color: var(--text-muted);
}

.assign select {
  padding: 0.35em 0.5em;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
}

.raw {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  align-items: flex-start;
}

.raw-text {
  width: 100%;
  max-height: 18em;
  overflow: auto;
  margin: 0;
  padding: 0.8em;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 0.78em;
  white-space: pre-wrap;
}

.footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5em;
  flex-wrap: wrap;
}
</style>
