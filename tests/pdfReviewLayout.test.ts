// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PdfReview from '@/components/import/PdfReview.vue'
import type { ImportDraft } from '@/services/pdfImport'

const field = (value: string) => ({ value, confidence: 'high' as const })
const draft = {
  fullName: field('Ana Martín'),
  headline: field(''),
  email: field('ana@example.com'),
  phone: field(''),
  location: field(''),
  links: [],
  sections: [],
  unclassified: [],
  rawText: 'Ana Martín\nana@example.com',
  warnings: [],
} as unknown as ImportDraft

function setDesktop(matches: boolean) {
  window.matchMedia = vi.fn(() => ({ matches, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia
}

afterEach(() => {
  // @ts-expect-error restore the jsdom default (no matchMedia)
  delete window.matchMedia
})

describe('PdfReview layout (spec 019)', () => {
  it('shows the extracted text beside the review on wide screens', () => {
    setDesktop(true)
    const wrapper = mount(PdfReview, { props: { draft } })
    expect(wrapper.find('.review--split').exists()).toBe(true)
    expect(wrapper.find('aside.source pre').text()).toContain('ana@example.com')
    expect(wrapper.find('section.raw').exists()).toBe(false)
  })

  it('keeps the toggle on narrower screens', () => {
    setDesktop(false)
    const wrapper = mount(PdfReview, { props: { draft } })
    expect(wrapper.find('aside.source').exists()).toBe(false)
    expect(wrapper.find('section.raw button').exists()).toBe(true)
  })
})
