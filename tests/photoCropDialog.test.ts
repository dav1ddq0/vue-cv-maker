// @vitest-environment jsdom
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

/** A 300 × 400 portrait; jsdom has no canvas, so the drawing is stubbed and only the geometry is real. */
vi.mock('@/services/photoCrop', () => ({
  decodePhoto: vi.fn(async () => ({ width: 300, height: 400 })),
  rotate: (source: { width: number; height: number }, turns: number) =>
    turns % 2 ? { width: source.height, height: source.width } : source,
  sizeOf: (source: { width: number; height: number }) => ({ width: source.width, height: source.height }),
  drawCrop: vi.fn(),
  encodeCrop: vi.fn(async () => new Blob(['jpeg'], { type: 'image/jpeg' })),
}))

import { encodeCrop } from '@/services/photoCrop'
import PhotoCropDialog from '@/components/form/PhotoCropDialog.vue'

beforeAll(() => {
  const proto = HTMLDialogElement.prototype
  proto.showModal = function (this: HTMLDialogElement) { this.setAttribute('open', '') }
  proto.close = function (this: HTMLDialogElement) {
    if (!this.hasAttribute('open')) return
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
})

async function openDialog() {
  const wrapper = mount(PhotoCropDialog, { props: { photo: null }, attachTo: document.body })
  await wrapper.setProps({ photo: new Blob(['x'], { type: 'image/png' }) })
  const use = () => wrapper.findAll('button').find((b) => b.text() === 'Usar foto')!
  await vi.waitFor(() => expect(use().attributes('disabled')).toBeUndefined())
  return { wrapper, use }
}

/** The rectangle the last confirm encoded. */
async function confirmedRect(use: () => ReturnType<ReturnType<typeof mount>['find']>) {
  vi.mocked(encodeCrop).mockClear()
  await use().trigger('click')
  await vi.waitFor(() => expect(encodeCrop).toHaveBeenCalled())
  return vi.mocked(encodeCrop).mock.calls[0]![1]
}

describe('PhotoCropDialog (spec 025)', () => {
  it('starts centred with the short side filling the frame, and emits the encoded crop', async () => {
    const { wrapper, use } = await openDialog()
    expect(await confirmedRect(use)).toEqual({ x: 0, y: 50, size: 300 })
    expect(wrapper.emitted('confirm')).toHaveLength(1)
    wrapper.unmount()
  })

  it('zooms with the labelled slider and with + / -', async () => {
    const { wrapper, use } = await openDialog()
    const slider = wrapper.find('input[type="range"]')
    expect(wrapper.find(`label[for="${slider.attributes('id')}"]`).text()).toBe('Zoom')
    await slider.setValue('2')
    expect((await confirmedRect(use)).size).toBe(150)

    await wrapper.find('.frame').trigger('keydown', { key: '-' })
    expect((await confirmedRect(use)).size).toBeCloseTo(300 / 1.9)
    wrapper.unmount()
  })

  it('moves with the arrow keys and stops at the edge', async () => {
    const { wrapper, use } = await openDialog()
    const frame = wrapper.find('.frame')
    for (let i = 0; i < 20; i++) await frame.trigger('keydown', { key: 'ArrowDown' })
    // Moving the image down shows its top: the crop reaches y = 0 and goes no further.
    expect((await confirmedRect(use)).y).toBe(0)
    wrapper.unmount()
  })

  it('rotates a quarter turn, which makes the portrait landscape', async () => {
    const { wrapper, use } = await openDialog()
    await wrapper.findAll('button').find((b) => b.text().includes('Girar'))!.trigger('click')
    expect(await confirmedRect(use)).toEqual({ x: 50, y: 0, size: 300 })
    wrapper.unmount()
  })

  it('reports a cancel when closed without confirming', async () => {
    const { wrapper } = await openDialog()
    await wrapper.findAll('button').find((b) => b.text() === 'Cancelar')!.trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('confirm')).toBeUndefined()
    wrapper.unmount()
  })
})
