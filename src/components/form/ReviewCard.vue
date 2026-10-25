<script setup lang="ts">
/** The CV review in the Export step (spec 023): a score and what to improve, each with a way there. */
import { computed } from 'vue'
import { useCvStore } from '@/stores/cv'
import { useUiStore } from '@/stores/ui'
import { useI18n } from '@/i18n'
import { cvScore, suggest, type Suggestion } from '@/core/suggestions'
import BaseButton from '@/components/ui/BaseButton.vue'

const cv = useCvStore()
const ui = useUiStore()
const { t } = useI18n()

const suggestions = computed(() => suggest(cv.data))
const score = computed(() => cvScore(cv.data))

/** An entry with neither position nor company still needs a name in the sentence. */
function message(item: Suggestion): string {
  const params = 'entry' in item.params && !item.params.entry ? { ...item.params, entry: t('review.untitledEntry') } : item.params
  return t(`review.items.${item.id}`, params)
}
</script>

<template>
  <section class="review" aria-labelledby="review-title">
    <div class="head">
      <h3 id="review-title" class="title">{{ t('review.title') }}</h3>
      <div class="score">
        <meter :min="0" :max="100" :low="50" :high="80" :optimum="100" :value="score" aria-hidden="true" />
        <span>
          <span class="sr-only">{{ t('review.scoreLabel') }}: </span>{{ t('review.score', { n: score }) }}
        </span>
      </div>
    </div>

    <p v-if="!suggestions.length" class="empty">{{ t('review.empty') }}</p>
    <ul v-else class="list">
      <li v-for="(item, index) in suggestions" :key="`${item.id}-${index}`" class="item">
        <span class="level" :class="`level--${item.level}`">{{ t(`review.${item.level}`) }}</span>
        <span class="text">{{ message(item) }}</span>
        <BaseButton size="sm" variant="ghost" @click="ui.goTo(item.step)">
          {{ t('review.goTo', { step: t(`steps.${item.step}`) }) }}
        </BaseButton>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.review {
  display: flex;
  flex-direction: column;
  gap: 0.8em;
  padding: 1em;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.6em 1em;
}

.title {
  margin: 0;
  font-size: 1em;
}

.score {
  display: flex;
  align-items: center;
  gap: 0.6em;
  font-size: 0.9em;
  font-weight: 600;
}

meter {
  width: 140px;
  height: 8px;
}

.empty {
  margin: 0;
  font-size: 0.9em;
  color: var(--text-muted);
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.4em 0.8em;
  padding: 0.55em 0;
  border-top: 1px solid var(--border);
}

.item:first-child {
  border-top: 0;
}

.level {
  padding: 0.1em 0.5em;
  border-radius: 999px;
  font-size: 0.75em;
  font-weight: 600;
  white-space: nowrap;
  /* Same width for both levels, so every message starts at the same x. */
  min-width: 7.5em;
  text-align: center;
  box-sizing: border-box;
}

.level--important {
  background: var(--warning-bg);
  border: 1px solid var(--warning-border);
}

.level--tip {
  background: var(--accent-soft);
  color: var(--text);
}

.text {
  font-size: 0.9em;
}

/* On a phone the button goes under the text instead of squeezing it. */
@media (max-width: 640px) {
  .item {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .item > :last-child {
    grid-column: 2;
    justify-self: start;
  }
}
</style>
