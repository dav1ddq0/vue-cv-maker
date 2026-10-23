// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import StepPersonal from '@/components/form/StepPersonal.vue'
import { useCvStore } from '@/stores/cv'
import es from '@/i18n/es'
import en from '@/i18n/en'
import { MARITAL_STATUSES } from '@/types/cv'

beforeEach(() => setActivePinia(createPinia()))

describe('StepPersonal additional data', () => {
  it('is collapsed for a CV without extras and says they are usually not needed', () => {
    const wrapper = mount(StepPersonal)
    const details = wrapper.find('details.extras')
    expect(details.attributes('open')).toBeUndefined()
    expect(details.find('.extras-note').text()).toContain('Normalmente no hacen falta')
  })

  it('opens by itself when the CV already has one of them', () => {
    useCvStore().data.personal.nationality = 'Española'
    const wrapper = mount(StepPersonal)
    expect(wrapper.find('details.extras').attributes('open')).toBeDefined()
  })

  it('writes the fields into the CV, including the marital status code', async () => {
    const cv = useCvStore()
    const wrapper = mount(StepPersonal)
    const fields = wrapper.findAll('details.extras input, details.extras select')
    expect(fields).toHaveLength(5)

    await wrapper.find('details.extras input[type="date"]').setValue('1992-03-12')
    await wrapper.find('details.extras select').setValue('married')
    expect(cv.data.personal.birthDate).toBe('1992-03-12')
    expect(cv.data.personal.maritalStatus).toBe('married')
  })

  it('does not fold while the last field is being cleared', async () => {
    const cv = useCvStore()
    cv.data.personal.drivingLicense = 'B'
    const wrapper = mount(StepPersonal)
    await wrapper.findAll('details.extras input')[3]!.setValue('')
    expect(wrapper.find('details.extras').attributes('open')).toBeDefined()
  })

  it('offers every marital status in both UI languages', () => {
    for (const dict of [es, en]) {
      expect(Object.keys(dict.personal.marital).sort()).toEqual([...MARITAL_STATUSES].sort())
    }
  })
})
