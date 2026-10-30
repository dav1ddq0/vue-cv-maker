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

  it('draws a different icon for e-mail, phone, location and links', () => {
    const wrapper = mount(Cobalt, { props: { data: createSampleCV() } })
    const icons = wrapper.findAll('.contact').map((row) => row.find('path').attributes('d'))
    // Sample CV: e-mail, phone, location, two links.
    expect(icons).toHaveLength(5)
    expect(new Set(icons).size).toBe(4)
    expect(icons[3]).toBe(icons[4])
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
