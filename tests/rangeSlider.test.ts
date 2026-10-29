// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import RangeSlider from '@/components/ui/RangeSlider.vue'

const mountSlider = (value: number) => {
  const wrapper = mount(RangeSlider, {
    props: { modelValue: value, min: 0.85, max: 1.3, step: 0.01, 'onUpdate:modelValue': (v: number) => void wrapper.setProps({ modelValue: v }) },
  })
  return wrapper
}

describe('RangeSlider (spec 044)', () => {
  it('is a native range input with the limits and step it was given, so keyboard and assistive technology work', () => {
    const input = mountSlider(1).find('input')
    expect(input.attributes()).toMatchObject({ type: 'range', min: '0.85', max: '1.3', step: '0.01' })
  })

  it('follows its model, as a number, in both directions', async () => {
    const wrapper = mountSlider(1)
    await wrapper.find('input').setValue('1.2')
    expect(wrapper.props('modelValue')).toBe(1.2)
    await wrapper.setProps({ modelValue: 0.9 })
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('0.9')
  })

  it('fills the track up to the thumb: the ratio of the value between the limits, kept inside 0 and 1', async () => {
    const ratio = (wrapper: ReturnType<typeof mountSlider>) => Number((wrapper.find('.slider').element as HTMLElement).style.getPropertyValue('--ratio'))
    expect(ratio(mountSlider(0.85))).toBe(0)
    expect(ratio(mountSlider(1.3))).toBe(1)
    expect(ratio(mountSlider(1.075))).toBeCloseTo(0.5, 5)
    expect(ratio(mountSlider(5))).toBe(1)
    expect(ratio(mountSlider(0))).toBe(0)
  })

  it('can be disabled, and the input says so', () => {
    const wrapper = mount(RangeSlider, { props: { modelValue: 1, min: 0, max: 2, step: 1, disabled: true } })
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
  })
})
