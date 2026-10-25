// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ReviewCard from '@/components/form/ReviewCard.vue'
import { useCvStore } from '@/stores/cv'
import { useUiStore } from '@/stores/ui'
import { createSampleCV } from '@/core/sample'
import { createExperience } from '@/core/factory'

beforeEach(() => setActivePinia(createPinia()))

describe('ReviewCard (spec 023)', () => {
  it('shows the score and a line with a way to fix each suggestion', async () => {
    const cv = useCvStore()
    cv.data = createSampleCV()
    cv.data.personal.headline = ''
    const wrapper = mount(ReviewCard)

    expect(wrapper.find('.score').text()).toMatch(/\d+ de 100/)
    const items = wrapper.findAll('.item')
    expect(items).toHaveLength(1)
    expect(items[0]!.text()).toContain('Consejo')
    expect(items[0]!.text()).toContain('Añade un titular')

    await items[0]!.find('button').trigger('click')
    expect(useUiStore().step).toBe('personal')
  })

  it('names the job in the message, with a fallback for an untitled one', () => {
    const cv = useCvStore()
    cv.data = createSampleCV()
    cv.data.experience.push({ ...createExperience(), startDate: '' })
    const text = mount(ReviewCard).text()
    expect(text).toContain('Revisa las fechas de «una experiencia sin título»')
  })

  it('says there is nothing to add when the CV passes every rule', () => {
    const cv = useCvStore()
    cv.data = createSampleCV()
    const wrapper = mount(ReviewCard)
    expect(wrapper.find('.list').exists()).toBe(false)
    expect(wrapper.text()).toContain('Nada que añadir')
    expect(wrapper.find('.score').text()).toContain('100 de 100')
  })
})
