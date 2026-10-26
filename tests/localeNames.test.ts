// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PreferencesPopover from '@/components/PreferencesPopover.vue'

beforeEach(() => setActivePinia(createPinia()))

describe('UI language options (spec 027)', () => {
  it('names each language in itself, with its lang, instead of "ES" / "EN"', () => {
    const wrapper = mount(PreferencesPopover)
    const options = wrapper.findAll('[role="radio"][lang]')
    expect(options.map((o) => [o.text(), o.attributes('lang')])).toEqual([
      ['Español', 'es'],
      ['English', 'en'],
    ])
  })
})
