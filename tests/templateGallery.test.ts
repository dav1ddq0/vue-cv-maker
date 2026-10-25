// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TemplateGallery from '@/components/form/TemplateGallery.vue'
import { templates } from '@/templates/registry'

describe('TemplateGallery', () => {
  const mountIt = (activeId = 'meridian') =>
    mount(TemplateGallery, { props: { templates, activeId, accentFor: (id: string) => (id === 'banner' ? '#123456' : '#654321') } })

  it('shows one card per registered template and marks only the active one', () => {
    const wrapper = mountIt('meridian')
    const cards = wrapper.findAll('button.card')
    expect(cards).toHaveLength(templates.length)
    expect(cards.filter((c) => c.attributes('aria-pressed') === 'true')).toHaveLength(1)
    expect(wrapper.find('button.card--active').text()).toContain('Meridian')
  })

  it('emits the id of the clicked template and nothing else', async () => {
    const wrapper = mountIt()
    await wrapper.findAll('button.card').find((c) => c.text().includes('Harbor'))!.trigger('click')
    expect(wrapper.emitted('pick')).toEqual([['harbor']])
  })

  it('previews each card in the accent the parent says it would get', () => {
    const wrapper = mountIt()
    const banner = wrapper.findAll('button.card').find((c) => c.text().includes('Banner'))!
    expect(banner.find('.thumb').attributes('style')).toContain('rgb(18, 52, 86)')
  })

  it('filters by tag and keeps the active template listed (spec 019)', async () => {
    const wrapper = mountIt('meridian')
    const ats = wrapper.findAll('button.filter').find((b) => b.text() === 'ATS')!
    await ats.trigger('click')
    expect(ats.attributes('aria-pressed')).toBe('true')
    const names = wrapper.findAll('.card-name').map((n) => n.text())
    const withAts = templates.filter((tpl) => tpl.tags.includes('tags.ats')).map((tpl) => tpl.name)
    expect(names).toEqual(expect.arrayContaining(withAts))
    expect(names).toContain('Meridian')
    expect(names.length).toBe(withAts.length + 1)

    await ats.trigger('click')
    expect(wrapper.findAll('button.card')).toHaveLength(templates.length)
  })
})
