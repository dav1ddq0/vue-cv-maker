<script setup lang="ts">
import { computed } from 'vue'
import { useUiStore } from '@/stores/ui'
import { useI18n } from '@/i18n'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useIsPhone } from '@/composables/useIsPhone'
import WizardNav from './WizardNav.vue'
import StepHeader from './StepHeader.vue'
import StepPersonal from './StepPersonal.vue'
import StepSummary from './StepSummary.vue'
import StepExperience from './StepExperience.vue'
import StepEducation from './StepEducation.vue'
import StepSkills from './StepSkills.vue'
import StepLanguages from './StepLanguages.vue'
import StepCustom from './StepCustom.vue'
import StepStyle from './StepStyle.vue'
import StepExport from './StepExport.vue'

const ui = useUiStore()
const { t } = useI18n()
const isPhone = useIsPhone()

/** Statically mapped rather than dynamically imported: nine small steps, and the
 *  user navigates freely between them, so lazy loading would only add flicker. */
const STEP_COMPONENTS = {
  personal: StepPersonal,
  summary: StepSummary,
  experience: StepExperience,
  education: StepEducation,
  skills: StepSkills,
  languages: StepLanguages,
  custom: StepCustom,
  style: StepStyle,
  export: StepExport,
} as const

const current = computed(() => STEP_COMPONENTS[ui.step])
</script>

<template>
  <div class="wizard">
    <StepHeader v-if="isPhone" />
    <template v-else>
      <WizardNav />
      <h2 class="heading">{{ t(`steps.${ui.step}`) }}</h2>
    </template>

    <div class="body">
      <component :is="current" :key="ui.step" />
    </div>

    <footer class="footer">
      <BaseButton :disabled="ui.stepIndex === 0" @click="ui.prevStep()">
        ← {{ t('actions.back') }}
      </BaseButton>

      <!--
        Below 1000px the preview has no column of its own, so its toggle joins
        the footer as a third control. It used to float over this bar, where it
        covered "Next" completely and blocked the wizard on every phone.
      -->
      <BaseButton class="preview-toggle" @click="ui.previewOpen = !ui.previewOpen">
        {{ ui.previewOpen ? t('preview.hide') : t('preview.show') }}
      </BaseButton>

      <BaseButton
        variant="primary"
        :disabled="ui.stepIndex === ui.steps.length - 1"
        @click="ui.nextStep()"
      >
        {{ t('actions.next') }} →
      </BaseButton>
    </footer>
  </div>
</template>

<style scoped>
.wizard {
  display: flex;
  flex-direction: column;
  gap: 1em;
  min-height: 0;
  /* No bottom padding: the sticky footer anchors to the padding box, so any
     padding here leaves a gap where content shows through under the bar. */
  padding: 1em 1.2em 0;
  overflow: auto;
}

.heading {
  margin: 0;
  font-size: 1.25em;
  font-weight: 650;
}

.body {
  flex: 1;
}

.footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.6em;
  padding: 0.8em 0;
  border-top: 1px solid var(--border);
  position: sticky;
  bottom: 0;
  background: var(--bg);
}

/* The preview has its own column above this width; the toggle is redundant. */
.preview-toggle {
  display: none;
}

@media (max-width: 1000px) {
  .preview-toggle {
    display: inline-flex;
  }
}

/* Phones: Back and Next share a row and the preview toggle takes its own, instead of three
   nowrap buttons pushing "Next" past the edge of a 320px screen. */
@media (max-width: 480px) {
  .preview-toggle {
    order: -1;
    flex: 1 1 100%;
    justify-content: center;
  }

  .footer > :not(.preview-toggle) {
    flex: 1 1 0;
    justify-content: center;
  }
}
</style>
