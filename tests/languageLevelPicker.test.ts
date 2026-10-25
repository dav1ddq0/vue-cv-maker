// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import LanguageLevelPicker from '@/components/form/LanguageLevelPicker.vue'

const mountIt = (modelValue: string, cvLanguage = 'es') =>
  mount(LanguageLevelPicker, { props: { modelValue, cvLanguage, label: 'Nivel de Inglés' } })

describe('LanguageLevelPicker (spec 019)', () => {
  it('offers A1–C2 and "Native" in the CV language', () => {
    expect(mountIt('').findAll('button').map((b) => b.text())).toEqual(['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Nativo'])
    expect(mountIt('', 'en').findAll('button').at(-1)!.text()).toBe('Native')
  })

  it('marks the current level, ignoring case, and writes the chosen one', async () => {
    const wrapper = mountIt('c1')
    const pressed = wrapper.findAll('button').filter((b) => b.attributes('aria-pressed') === 'true')
    expect(pressed.map((b) => b.text())).toEqual(['C1'])
    await wrapper.findAll('button')[2]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['B1']])
  })

  it('leaves a free-text level unmarked', () => {
    const wrapper = mountIt('Bilingüe')
    expect(wrapper.findAll('button[aria-pressed="true"]')).toHaveLength(0)
  })
})
