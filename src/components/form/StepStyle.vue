<script setup lang="ts">
import { computed } from 'vue'
import { useCvStore } from '@/stores/cv'
import { useUiStore } from '@/stores/ui'
import { useI18n } from '@/i18n'
import { useCapabilities } from '@/composables/useCapabilities'
import { applyTemplateDefaults, templates } from '@/templates/registry'
import BaseField from '@/components/ui/BaseField.vue'
import { CV_LANGUAGES, FONT_OPTIONS, PALETTE, isSameColor } from '@/core/stylePresets'

const cv = useCvStore()
const ui = useUiStore()
const { t } = useI18n()
const { supports, reasonFor } = useCapabilities()
const accentSupported = supports('accentColor')
const fontSupported = supports('customFont')
const accentReason = reasonFor('accentColor')
const fontReason = reasonFor('customFont')

const style = computed(() => cv.data.style)

/**
 * Picking a template also adopts its accent and face — but only while the user
 * has not chosen their own. `applyTemplateDefaults` decides that; once someone
 * sets a custom accent, switching templates never overwrites it again.
 */
function pickTemplate(id: string) {
  ui.setTemplate(id)
  cv.data.style = applyTemplateDefaults(id, cv.data.style)
}

/**
 * The accent each card would actually produce if clicked: its own default while
 * the user is still on defaults, or the user's chosen accent once they have one.
 * Painting every thumbnail in the current accent hid the very differences the
 * gallery exists to show.
 */
function previewAccent(id: string): string {
  return applyTemplateDefaults(id, style.value).accentColor
}
</script>

<template>
  <div class="step">
    <section class="block">
      <h3 class="subtitle">{{ t('style.template') }}</h3>
      <ul class="templates">
        <li v-for="template in templates" :key="template.id">
          <button
            type="button"
            class="card"
            :class="{ 'card--active': ui.templateId === template.id }"
            :aria-pressed="ui.templateId === template.id"
            @click="pickTemplate(template.id)"
          >
            <!-- Static, authored SVG from the template definition — never user input. -->
            <span
              class="thumb"
              role="img"
              :aria-label="template.name"
              :style="{ color: previewAccent(template.id) }"
              v-html="template.thumbnail"
            />
            <span class="card-name">{{ template.name }}</span>
            <span class="card-tags">
              <span v-for="tag in template.tags" :key="tag" class="tag">{{ t(tag) }}</span>
            </span>
            <span class="card-desc">{{ t(template.descriptionKey) }}</span>
          </button>
        </li>
      </ul>
    </section>

    <section class="block">
      <div class="grid">
        <BaseField
          v-slot="{ id }"
          :label="t('style.accentColor')"
          :disabled="!accentSupported"
          :disabled-reason="accentReason"
        >
          <div class="color-row" role="group" :aria-label="t('style.palette')">
            <button
              v-for="color in PALETTE"
              :key="color"
              type="button"
              class="swatch"
              :style="{ background: color }"
              :aria-label="color"
              :aria-pressed="isSameColor(style.accentColor, color)"
              :disabled="!accentSupported"
              @click="style.accentColor = color"
            >
              <span v-if="isSameColor(style.accentColor, color)" aria-hidden="true">✓</span>
            </button>
            <input :id="id" v-model="style.accentColor" type="color" :disabled="!accentSupported" />
          </div>
        </BaseField>

        <BaseField
          v-slot="{ id }"
          :label="t('style.fontFamily')"
          :disabled="!fontSupported"
          :disabled-reason="fontReason"
        >
          <select :id="id" v-model="style.fontFamily" :disabled="!fontSupported">
            <option v-for="font in FONT_OPTIONS" :key="font.id" :value="font.value">
              {{ font.label }} · {{ t(`style.fonts.${font.id}`) }}
            </option>
          </select>
        </BaseField>

        <BaseField v-slot="{ id }" :label="t('style.cvLanguage')" :hint="t('style.cvLanguageHint')">
          <select :id="id" v-model="cv.data.meta.language">
            <option v-for="language in CV_LANGUAGES" :key="language.code" :value="language.code">
              {{ language.label }}
            </option>
          </select>
        </BaseField>

        <BaseField v-slot="{ id }" :label="`${t('style.fontScale')} · ${style.fontScale.toFixed(2)}×`">
          <input :id="id" v-model.number="style.fontScale" type="range" min="0.85" max="1.15" step="0.01" />
        </BaseField>

        <BaseField
          v-slot="{ id }"
          :label="`${t('style.spacingScale')} · ${style.spacingScale.toFixed(2)}×`"
        >
          <input
            :id="id"
            v-model.number="style.spacingScale"
            type="range"
            min="0.85"
            max="1.3"
            step="0.01"
          />
        </BaseField>

        <BaseField v-slot="{ id }" :label="t('style.pageMargin')">
          <select :id="id" v-model="style.pageMargin">
            <option v-for="margin in ['10mm', '13mm', '16mm', '20mm']" :key="margin" :value="margin">
              {{ margin }}
            </option>
          </select>
        </BaseField>
      </div>
    </section>
  </div>
</template>

<style scoped>
.step {
  display: flex;
  flex-direction: column;
  gap: 1.6em;
}

.block {
  display: flex;
  flex-direction: column;
  gap: 0.8em;
}

.subtitle {
  margin: 0;
  font-size: 0.95em;
  font-weight: 600;
}

.templates {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.8em;
}

.card {
  display: grid;
  gap: 0.3em;
  width: 100%;
  text-align: left;
  padding: 0.6em;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.card--active {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent);
}

.thumb {
  display: block;
  width: 100%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: #fff;
}

.thumb :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.card-name {
  font-weight: 600;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25em;
}

/* Lets someone choose by shape without reading three paragraphs. */
.tag {
  font-size: 0.68em;
  letter-spacing: 0.02em;
  padding: 0.1em 0.45em;
  border-radius: 999px;
  background: var(--surface-2);
  color: var(--text-muted);
  white-space: nowrap;
}

.card--active .tag {
  background: var(--accent-soft);
}

.card-desc {
  font-size: 0.78em;
  color: var(--text-muted);
  line-height: 1.35;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.9em;
}

input[type='color'] {
  height: 2.4em;
  padding: 0.2em;
}

.color-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4em;
}

.swatch {
  width: 2.2em;
  height: 2.2em;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 50%;
  color: #1a1a1a;
  font-weight: 700;
  line-height: 1;
  text-shadow: 0 0 3px #fff;
}

.swatch[aria-pressed='true'] {
  box-shadow: 0 0 0 2px var(--surface), 0 0 0 4px var(--accent);
}

.color-row input[type='color'] {
  width: 3em;
}
</style>
