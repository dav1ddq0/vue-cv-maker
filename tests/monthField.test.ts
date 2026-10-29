// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import MonthField from '@/components/ui/MonthField.vue'
import { setLocale } from '@/i18n'

const mountField = (value: string) => {
  const wrapper = mount(MonthField, {
    props: { modelValue: value, label: 'Inicio', 'onUpdate:modelValue': (v: string) => void wrapper.setProps({ modelValue: v }) },
  })
  return wrapper
}
const stored = (wrapper: ReturnType<typeof mountField>) => wrapper.props('modelValue')

describe('MonthField (spec 038)', () => {
  it('shows a stored month and year in its two controls', () => {
    const wrapper = mountField('2022-03')
    expect((wrapper.find('select').element as HTMLSelectElement).value).toBe('03')
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('2022')
  })

  it('accepts a year alone, which a PDF import produces, and keeps it', async () => {
    const wrapper = mountField('2021')
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('2021')
    expect((wrapper.find('select').element as HTMLSelectElement).value).toBe('')
    await wrapper.find('select').setValue('06')
    expect(stored(wrapper)).toBe('2021-06')
    await wrapper.find('select').setValue('')
    expect(stored(wrapper)).toBe('2021')
  })

  it('stores nothing for a month without a year, and keeps the month while the year is typed', async () => {
    const wrapper = mountField('')
    await wrapper.find('select').setValue('09')
    expect(stored(wrapper)).toBe('')
    expect((wrapper.find('select').element as HTMLSelectElement).value).toBe('09')
    await wrapper.find('input').setValue('2019')
    expect(stored(wrapper)).toBe('2019-09')
  })

  it('keeps digits only, at most four, and does not store a partial year', async () => {
    const wrapper = mountField('2020-01')
    const year = wrapper.find('input')
    await year.setValue('20a2b')
    expect((year.element as HTMLInputElement).value).toBe('202')
    expect(stored(wrapper)).toBe('')
    await year.setValue('202345')
    expect((year.element as HTMLInputElement).value).toBe('2023')
    expect(stored(wrapper)).toBe('2023-01')
  })

  it('follows the model when it changes from outside, as undo does', async () => {
    const wrapper = mountField('2020-01')
    await wrapper.setProps({ modelValue: '2018-11' })
    expect((wrapper.find('select').element as HTMLSelectElement).value).toBe('11')
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('2018')
    await wrapper.setProps({ modelValue: '' })
    expect((wrapper.find('select').element as HTMLSelectElement).value).toBe('')
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('')
  })

  it('names the months in the UI language, not the browser one', async () => {
    setLocale('es')
    const es = mountField('')
    expect(es.findAll('option')[3]!.text()).toBe('Marzo')
    setLocale('en')
    const en = mountField('')
    expect(en.findAll('option')[3]!.text()).toBe('March')
    setLocale('es')
  })

  it('names each control for assistive technology', () => {
    const wrapper = mountField('')
    expect(wrapper.find('select').attributes('aria-label')).toBe('Inicio · Mes')
    expect(wrapper.find('input').attributes('aria-label')).toBe('Inicio · Año')
  })
})
