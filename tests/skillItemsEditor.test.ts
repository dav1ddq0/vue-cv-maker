// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SkillItemsEditor from '@/components/ui/SkillItemsEditor.vue'

const last = (wrapper: ReturnType<typeof mount>) => wrapper.emitted('update:modelValue')!.at(-1)![0]

describe('SkillItemsEditor', () => {
  it('adds several skills from a comma-separated entry', async () => {
    const wrapper = mount(SkillItemsEditor, { props: { modelValue: [{ name: 'Go', level: 4 }] } })
    await wrapper.find('input.add').setValue('Vue, Rust ,')
    await wrapper.find('input.add').trigger('keydown', { key: 'Enter' })

    expect(last(wrapper)).toEqual([{ name: 'Go', level: 4 }, { name: 'Vue' }, { name: 'Rust' }])
  })

  it('sets and clears a level without touching the name', async () => {
    const wrapper = mount(SkillItemsEditor, { props: { modelValue: [{ name: 'Go' }] } })
    await wrapper.find('select.level').setValue('3')
    expect(last(wrapper)).toEqual([{ name: 'Go', level: 3 }])

    await wrapper.setProps({ modelValue: [{ name: 'Go', level: 3 }] })
    await wrapper.find('select.level').setValue('')
    expect(last(wrapper)).toEqual([{ name: 'Go' }])
    expect('level' in (last(wrapper) as any[])[0]).toBe(false)
  })

  it('renames and removes a skill', async () => {
    const wrapper = mount(SkillItemsEditor, { props: { modelValue: [{ name: 'A' }, { name: 'B' }] } })
    await wrapper.findAll('input.name')[0]!.setValue('Z')
    expect(last(wrapper)).toEqual([{ name: 'Z' }, { name: 'B' }])

    // With no parent bound, defineModel keeps the rename locally, as a v-model parent would.
    await wrapper.findAll('button.remove')[1]!.trigger('click')
    expect(last(wrapper)).toEqual([{ name: 'Z' }])
  })

  it('keeps each row on its own element when a row above it is removed (spec 028)', async () => {
    const wrapper = mount(SkillItemsEditor, {
      props: {
        modelValue: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
        'onUpdate:modelValue': (value: unknown) => void wrapper.setProps({ modelValue: value as never }),
      },
    })
    const rowB = wrapper.findAll('.row')[1]!.element
    await wrapper.findAll('button.remove')[0]!.trigger('click')
    expect(wrapper.findAll('.row')[0]!.element).toBe(rowB)
    expect((wrapper.findAll('input.name')[0]!.element as HTMLInputElement).value).toBe('B')
  })
})
