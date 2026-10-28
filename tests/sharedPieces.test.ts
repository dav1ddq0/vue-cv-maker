// @vitest-environment jsdom
import { beforeAll, describe, expect, it } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import DateRangeFields from '@/components/form/DateRangeFields.vue'
import { useModalDialog } from '@/composables/useModalDialog'

beforeAll(() => {
  const proto = HTMLDialogElement.prototype
  proto.showModal = function (this: HTMLDialogElement) { this.setAttribute('open', '') }
  proto.close = function (this: HTMLDialogElement) { this.removeAttribute('open') }
})

describe('DateRangeFields (spec 028)', () => {
  const mountRange = (start: string, end: string | null) =>
    mount(DateRangeFields, {
      props: {
        start,
        end,
        'onUpdate:start': (value: string) => void wrapper.setProps({ start: value }),
        'onUpdate:end': (value: string | null) => void wrapper.setProps({ end: value }),
      },
    })
  let wrapper: ReturnType<typeof mountRange>

  it('"currently here" sets the end to null and disables it; unticking leaves it empty', async () => {
    wrapper = mountRange('2021-03', '2022-01')
    const current = wrapper.find('input[type="checkbox"]')
    await current.setValue(true)
    expect(wrapper.emitted('update:end')!.at(-1)).toEqual([null])
    expect(wrapper.findAll('input[type="month"]')[1]!.attributes('disabled')).toBeDefined()
    await current.setValue(false)
    expect(wrapper.emitted('update:end')!.at(-1)).toEqual([''])
  })

  it('edits both dates and warns when the end comes first', async () => {
    wrapper = mountRange('2021-03', '2022-01')
    const [startInput, endInput] = wrapper.findAll('input[type="month"]')
    await startInput!.setValue('2020-05')
    expect(wrapper.emitted('update:start')!.at(-1)).toEqual(['2020-05'])
    await endInput!.setValue('2019-01')
    expect(wrapper.emitted('update:end')!.at(-1)).toEqual(['2019-01'])
    expect(wrapper.text()).toContain('anterior')
  })
})

describe('useModalDialog (spec 028)', () => {
  const Host = defineComponent({
    props: { open: Boolean },
    setup(props) {
      const dialog = ref<HTMLDialogElement | null>(null)
      useModalDialog(dialog, () => props.open)
      return () => h('dialog', { ref: dialog })
    },
  })

  it('opens on mount when already open, and follows the flag after that', async () => {
    const wrapper = mount(Host, { props: { open: true }, attachTo: document.body })
    expect(wrapper.find('dialog').attributes('open')).toBeDefined()
    await wrapper.setProps({ open: false })
    expect(wrapper.find('dialog').attributes('open')).toBeUndefined()
    await wrapper.setProps({ open: true })
    expect(wrapper.find('dialog').attributes('open')).toBeDefined()
    wrapper.unmount()
  })
})
