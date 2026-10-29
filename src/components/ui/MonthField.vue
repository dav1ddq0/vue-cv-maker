<script setup lang="ts">
/**
 * A month and a year for a date that may be partial (spec 038). The value is `''`, `YYYY` or
 * `YYYY-MM`: the month is optional, a month without a year stores nothing. Two native controls
 * instead of `<input type="month">`, so the month names follow the UI language and a year-only date
 * (which PDF import produces) shows up instead of reading as empty.
 */
import { computed, ref, watch } from 'vue'
import { useI18n } from '@/i18n'

const props = defineProps<{ id?: string; label: string; disabled?: boolean }>()
const model = defineModel<string>({ required: true })

const { t, locale } = useI18n()

const split = (value: string) => {
  const match = /^(\d{4})(?:-(\d{2}))?$/.exec(value)
  return { year: match?.[1] ?? '', month: match?.[2] ?? '' }
}

const year = ref(split(model.value).year)
const month = ref(split(model.value).month)

const value = computed(() => (/^\d{4}$/.test(year.value) ? (month.value ? `${year.value}-${month.value}` : year.value) : ''))

// Follows the model when it changes from outside (undo, import), but not while a half-typed value
// (a month with no year yet) produces the same stored value.
watch(model, (next) => {
  if (next === value.value) return
  ;({ year: year.value, month: month.value } = split(next))
})

function commit() {
  if (value.value !== model.value) model.value = value.value
}

function onYear(event: Event) {
  const input = event.target as HTMLInputElement
  year.value = input.value = input.value.replace(/\D/g, '').slice(0, 4)
  commit()
}

const months = computed(() => {
  const names = new Intl.DateTimeFormat(locale.value, { month: 'long' })
  return Array.from({ length: 12 }, (_, i) => {
    const name = names.format(new Date(2000, i, 1))
    return { value: String(i + 1).padStart(2, '0'), name: name.charAt(0).toLocaleUpperCase(locale.value) + name.slice(1) }
  })
})
</script>

<template>
  <div class="month-field" role="group" :aria-label="props.label">
    <select
      :id="id"
      v-model="month"
      class="month"
      :disabled="disabled"
      :aria-label="`${props.label} · ${t('experience.month')}`"
      @change="commit"
    >
      <option value="">{{ t('experience.month') }}</option>
      <option v-for="m in months" :key="m.value" :value="m.value">{{ m.name }}</option>
    </select>
    <input
      class="year"
      :value="year"
      :disabled="disabled"
      inputmode="numeric"
      autocomplete="off"
      maxlength="4"
      :placeholder="t('experience.year')"
      :aria-label="`${props.label} · ${t('experience.year')}`"
      @input="onYear"
    />
  </div>
</template>

<style scoped>
.month-field {
  display: flex;
  gap: 8px;
  align-items: center;
}

.month,
.year {
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: var(--type-body-large);
  letter-spacing: var(--tracking-body-large);
  outline: none;
}

.month {
  flex: 1;
  min-height: 24px;
}

.year {
  width: 4.5em;
  text-align: end;
  font-variant-numeric: tabular-nums;
}

.month:focus-visible,
.year:focus-visible {
  box-shadow: 0 2px 0 var(--md-primary);
}

.month option {
  color: initial;
}

:disabled {
  color: inherit;
  opacity: 1;
  cursor: not-allowed;
}
</style>
