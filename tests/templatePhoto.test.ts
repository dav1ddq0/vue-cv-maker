// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { templates } from '@/templates/registry'
import { createSampleCV } from '@/core/sample'

/** A template that declares `photo` must draw it when present and nothing when absent. */
describe.each(templates.filter((t) => t.supports.includes('photo')))('$name photo', (definition) => {
  it('renders the photo only when there is one', async () => {
    const component = await definition.component()

    const withPhoto = createSampleCV()
    withPhoto.personal.photo = 'blob:http://localhost/photo'
    expect(mount(component as any, { props: { data: withPhoto } }).find('img').attributes('src')).toBe(
      'blob:http://localhost/photo',
    )

    const without = createSampleCV()
    delete without.personal.photo
    expect(mount(component as any, { props: { data: without } }).find('img').exists()).toBe(false)
  })
})

describe.each(templates.filter((t) => !t.supports.includes('photo')))('$name without photo support', (definition) => {
  it('never draws an image even when the data has a photo', async () => {
    const component = await definition.component()
    const data = createSampleCV()
    data.personal.photo = 'blob:http://localhost/photo'
    expect(mount(component as any, { props: { data } }).find('img').exists()).toBe(false)
  })
})
