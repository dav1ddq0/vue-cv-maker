// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import FileDropzone from '@/components/import/FileDropzone.vue'
import { matchesAccept } from '@/core/fileAccept'

const file = (name: string, type: string) => new File(['x'], name, { type })

describe('matchesAccept', () => {
  it('reads extensions, exact MIME types and wildcards like the accept attribute', () => {
    expect(matchesAccept(file('cv.JSON', ''), '.json,application/json')).toBe(true)
    expect(matchesAccept(file('cv', 'application/json'), '.json,application/json')).toBe(true)
    expect(matchesAccept(file('me.png', 'image/png'), 'image/*')).toBe(true)
    expect(matchesAccept(file('me.webp', 'image/webp'), ' image/* ')).toBe(true)
  })

  it('rejects anything else', () => {
    expect(matchesAccept(file('cv.pdf', 'application/pdf'), '.json,application/json')).toBe(false)
    expect(matchesAccept(file('notes.txt', 'text/plain'), 'image/*')).toBe(false)
    expect(matchesAccept(file('x', ''), 'image/*')).toBe(false)
    expect(matchesAccept(file('x.png', 'image/png'), '')).toBe(false)
  })
})

describe('FileDropzone', () => {
  const mountIt = (props: Record<string, unknown> = {}) =>
    mount(FileDropzone, { props: { accept: 'image/*', ...props }, slots: { default: 'Drop it' } })

  it('is a label around a native file input, so keyboard and screen readers need no scripting', () => {
    const wrapper = mountIt()
    expect(wrapper.element.tagName).toBe('LABEL')
    expect(wrapper.find('input[type="file"]').exists()).toBe(true)
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.find('input').attributes('accept')).toBe('image/*')
    expect(wrapper.text()).toContain('Drop it')
  })

  it('emits a picked file and clears the input so the same file can be picked again', async () => {
    const wrapper = mountIt()
    const input = wrapper.find('input').element as HTMLInputElement
    const picked = file('me.png', 'image/png')
    Object.defineProperty(input, 'files', { value: [picked], configurable: true })
    await wrapper.find('input').trigger('change')

    expect(wrapper.emitted('file')![0]).toEqual([picked])
    expect(wrapper.find('.note--error').exists()).toBe(false)
  })

  it('emits a dropped file that matches and shows an alert for one that does not', async () => {
    const wrapper = mountIt()
    const good = file('me.png', 'image/png')
    await wrapper.trigger('drop', { dataTransfer: { files: [good] } })
    expect(wrapper.emitted('file')).toHaveLength(1)

    await wrapper.trigger('drop', { dataTransfer: { files: [file('notes.txt', 'text/plain')] } })
    expect(wrapper.emitted('file')).toHaveLength(1)
    const alert = wrapper.find('[role="alert"]')
    expect(alert.exists()).toBe(true)
    expect(wrapper.find('input').attributes('aria-describedby')).toBe(alert.attributes('id'))
  })

  it('highlights while dragging over and clears on drop', async () => {
    const wrapper = mountIt()
    await wrapper.trigger('dragover')
    expect(wrapper.classes()).toContain('dropzone--over')
    await wrapper.trigger('drop', { dataTransfer: { files: [] } })
    expect(wrapper.classes()).not.toContain('dropzone--over')
  })

  it('keeps the highlight when the drag moves onto a child, and clears it when it leaves the control', async () => {
    const wrapper = mount(FileDropzone, { props: { accept: 'image/*' }, attachTo: document.body })
    await wrapper.trigger('dragover')
    expect(wrapper.classes()).toContain('dropzone--over')

    await wrapper.trigger('dragleave', { relatedTarget: wrapper.find('.icon').element })
    expect(wrapper.classes()).toContain('dropzone--over')

    await wrapper.trigger('dragleave', { relatedTarget: document.body })
    expect(wrapper.classes()).not.toContain('dropzone--over')
    wrapper.unmount()
  })

  it('ignores drops and disables the input while busy or disabled', async () => {
    const busy = mountIt({ busy: true })
    expect(busy.find('input').attributes('disabled')).toBeDefined()
    expect(busy.attributes('aria-busy')).toBe('true')
    await busy.trigger('drop', { dataTransfer: { files: [file('me.png', 'image/png')] } })
    expect(busy.emitted('file')).toBeUndefined()

    const off = mountIt({ disabled: true })
    await off.trigger('dragover')
    expect(off.classes()).not.toContain('dropzone--over')
  })

  it('describes the control with its hint', () => {
    const wrapper = mountIt({ hint: 'PNG, JPG' })
    const note = wrapper.find('.note')
    expect(note.text()).toBe('PNG, JPG')
    expect(wrapper.find('input').attributes('aria-describedby')).toBe(note.attributes('id'))
  })
})
