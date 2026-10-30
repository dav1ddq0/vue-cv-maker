// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createSampleCV } from '@/core/sample'
import Cobalt from '@/templates/cobalt/Template.vue'

const source = readFileSync('src/templates/cobalt/Template.vue', 'utf8')

describe('Cobalt (spec 046)', () => {
  it('makes room for the photo in the header only when there is one', () => {
    const data = createSampleCV()
    data.personal.photo = 'data:image/png;base64,AAAA'
    const withPhoto = mount(Cobalt, { props: { data } })
    expect(withPhoto.classes()).toContain('cobalt--photo')
    expect(withPhoto.find('img.photo').exists()).toBe(true)

    data.personal.photo = ''
    const without = mount(Cobalt, { props: { data } })
    expect(without.classes()).not.toContain('cobalt--photo')
    expect(without.find('img.photo').exists()).toBe(false)
  })

  it('draws a different icon for e-mail, phone, location, LinkedIn and GitHub', () => {
    const wrapper = mount(Cobalt, { props: { data: createSampleCV() } })
    const icons = wrapper.findAll('.contact').map((row) => row.find('path').attributes('d'))
    // Sample CV: e-mail, phone, location, then LinkedIn and GitHub, each with its own glyph.
    expect(icons).toHaveLength(5)
    expect(new Set(icons).size).toBe(5)
  })

  it('keeps skills and languages in the sidebar and the career in the main column', () => {
    const wrapper = mount(Cobalt, { props: { data: createSampleCV() } })
    const kinds = (selector: string) => wrapper.find(selector).findAll('[data-section]').map((el) => el.attributes('data-section'))
    expect(kinds('aside')).toEqual(['skills', 'languages'])
    expect(kinds('main')).toEqual(expect.arrayContaining(['summary', 'experience', 'education']))
  })

  it('sets a skill group name smaller than its items, which is how a PDF import tells them apart', () => {
    const size = /\.skill-category\s*\{[^}]*font-size:\s*([\d.]+)em/.exec(source)?.[1]
    expect(Number(size)).toBeLessThan(1)
  })
})

describe('Cobalt: a long list of skills (spec 052)', () => {
  const withSkills = (n: number) => {
    const data = createSampleCV()
    data.skills = [{ id: 'g', category: '', items: Array.from({ length: n }, (_, i) => ({ name: `Skill ${i}` })) }]
    return mount(Cobalt, { props: { data } })
  }

  it('gives a short unnamed group a bullet each, and a long one a single line, so the sidebar stays short', () => {
    const short = withSkills(8)
    expect(short.findAll('aside .bullets li')).toHaveLength(8)
    const long = withSkills(11)
    expect(long.find('aside .bullets').exists()).toBe(false)
    expect(long.find('aside .skill-items').text()).toContain('Skill 10')
  })
})

