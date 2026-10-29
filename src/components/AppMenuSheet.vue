<script setup lang="ts">
/** Phone menu (spec 016): what the one-row header cannot hold — views, language, theme, storage note. */
import { useUiStore } from '@/stores/ui'
import { LOCALE_NAMES, useI18n, type Locale } from '@/i18n'
import BottomSheet from '@/components/ui/BottomSheet.vue'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const ui = useUiStore()
const { t, locale, availableLocales } = useI18n()

const VIEWS = ['editor', 'documents', 'import'] as const

function go(view: (typeof VIEWS)[number]) {
  ui.view = view
  emit('close')
}
</script>

<template>
  <BottomSheet :open="open" :title="t('menu.title')" @close="emit('close')">
    <nav class="views" :aria-label="t('menu.title')">
      <button
        v-for="view in VIEWS"
        :key="view"
        type="button"
        class="row"
        :class="{ 'row--current': ui.view === view }"
        :aria-current="ui.view === view ? 'page' : undefined"
        @click="go(view)"
      >
        {{ t(`nav.${view}`) }}
      </button>
    </nav>

    <div class="prefs">
      <div class="pref">
        <span :id="'menu-lang'" class="pref-label">{{ t('nav.language') }}</span>
        <div class="segments m3-segmented" role="radiogroup" aria-labelledby="menu-lang">
          <button
            v-for="code in availableLocales"
            :key="code"
            type="button"
            role="radio"
            class="segment m3-segment m3-state m3-target"
            :aria-checked="locale === code"
            :lang="code"
            @click="locale = code as Locale"
          >
            {{ LOCALE_NAMES[code as Locale] }}
          </button>
        </div>
      </div>
      <div class="pref">
        <span :id="'menu-theme'" class="pref-label">{{ t('nav.theme') }}</span>
        <div class="segments m3-segmented" role="radiogroup" aria-labelledby="menu-theme">
          <button type="button" role="radio" class="segment m3-segment m3-state m3-target" :aria-checked="ui.theme === 'light'" @click="ui.setTheme('light')">
            {{ t('menu.light') }}
          </button>
          <button type="button" role="radio" class="segment m3-segment m3-state m3-target" :aria-checked="ui.theme === 'dark'" @click="ui.setTheme('dark')">
            {{ t('menu.dark') }}
          </button>
          <button type="button" role="radio" class="segment m3-segment m3-state m3-target" :aria-checked="ui.theme === 'system'" @click="ui.setTheme('system')">
            {{ t('menu.system') }}
          </button>
        </div>
      </div>
    </div>

    <p class="note">{{ t('notices.notPersisted') }}</p>
  </BottomSheet>
</template>

<style scoped>
.views {
  display: flex;
  flex-direction: column;
  padding: 0 0.5em;
}

.row {
  min-height: 52px;
  padding: 0 0.8em;
  border: 0;
  border-radius: var(--shape-md);
  background: transparent;
  color: var(--text);
  font: inherit;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}

.row--current {
  background: var(--accent-soft);
}

.prefs {
  display: flex;
  flex-direction: column;
  gap: 0.8em;
  margin: 0.6em 1em 0;
  padding-top: 0.8em;
  border-top: 1px solid var(--border);
}

.pref {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1em;
}

.pref-label {
  font-weight: 600;
}




.note {
  margin: 0.8em 1em 0;
  font-size: var(--size-12);
  line-height: 1.45;
  color: var(--text-muted);
}
</style>
