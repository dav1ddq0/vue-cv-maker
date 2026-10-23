// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import LevelDots from '@/templates/LevelDots.vue'

describe.each(['dots', 'stars', 'bars', 'dashes'] as const)('LevelDots variant %s', (variant) => {
  it('draws five marks with the level filled and an accessible label', () => {
    const wrapper = mount(LevelDots, { props: { score: 3, label: 'Nivel 3 de 5', variant } })

    expect(wrapper.classes()).toContain(`v-${variant}`)
    expect(wrapper.findAll('.mark')).toHaveLength(5)
    expect(wrapper.findAll('.mark.on')).toHaveLength(3)
    expect(wrapper.attributes('role')).toBe('img')
    expect(wrapper.attributes('aria-label')).toBe('Nivel 3 de 5')
    expect(wrapper.findAll('.mark').every((m) => m.attributes('aria-hidden') === 'true')).toBe(true)
  })
})

describe('LevelDots', () => {
  it('defaults to dots', () => {
    expect(mount(LevelDots, { props: { score: 1, label: 'x' } }).classes()).toContain('v-dots')
  })
})
