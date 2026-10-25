// @vitest-environment jsdom
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/services/storage', async (original) => ({
  ...(await original<typeof import('@/services/storage')>()),
  savePhoto: vi.fn(async () => 'photo:cv_test'),
}))

/** jsdom has no canvas: the crop dialog's drawing is stubbed, its flow is real. */
const cropped = new Blob(['jpeg'], { type: 'image/jpeg' })
vi.mock('@/services/photoCrop', () => ({
  decodePhoto: vi.fn(async () => ({ width: 300, height: 400 })),
  rotate: (source: unknown) => source,
  sizeOf: (source: { width: number; height: number }) => ({ width: source.width, height: source.height }),
  drawCrop: vi.fn(),
  encodeCrop: vi.fn(async () => cropped),
}))

import { savePhoto } from '@/services/storage'
import StepPersonal from '@/components/form/StepPersonal.vue'
import { useCvStore } from '@/stores/cv'

beforeAll(() => {
  const proto = HTMLDialogElement.prototype
  proto.showModal = function (this: HTMLDialogElement) { this.setAttribute('open', '') }
  proto.close = function (this: HTMLDialogElement) {
    if (!this.hasAttribute('open')) return
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
})

beforeEach(() => {
  vi.mocked(savePhoto).mockClear()
  setActivePinia(createPinia())
  // Classic shows no photo, which disables the field; Meridian does.
  useCvStore().setTemplate('meridian')
})

function dropOn(wrapper: ReturnType<typeof mount>, file: File) {
  const input = wrapper.find('.photo-drop input[type="file"]')
  Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
  return input.trigger('change')
}

describe('StepPersonal photo checks (spec 020)', () => {
  it('refuses a photo over 5 MB with its size and stores nothing', async () => {
    const cv = useCvStore()
    const wrapper = mount(StepPersonal)
    const big = new File([new Uint8Array(6 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' })
    await dropOn(wrapper, big)
    await vi.waitFor(() => expect(wrapper.text()).toContain('La foto pesa 6.0 MB; el máximo es 5 MB'))
    expect(savePhoto).not.toHaveBeenCalled()
    expect(cv.data.personal.photo).toBeUndefined()
  })

})

describe('StepPersonal photo crop (spec 025)', () => {
  const useButton = (wrapper: ReturnType<typeof mount>) =>
    wrapper.findAll('dialog button').find((b) => b.text() === 'Usar foto')!

  it('frames a photo within the limit before storing the cropped result', async () => {
    const cv = useCvStore()
    const wrapper = mount(StepPersonal, { attachTo: document.body })
    await dropOn(wrapper, new File([new Uint8Array(1024)], 'me.png', { type: 'image/png' }))
    await vi.waitFor(() => expect(wrapper.find('dialog').attributes('open')).toBeDefined())
    expect(savePhoto).not.toHaveBeenCalled()

    await vi.waitFor(() => expect(useButton(wrapper).attributes('disabled')).toBeUndefined())
    await useButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(cv.data.personal.photo).toBe('photo:cv_test'))
    expect(savePhoto).toHaveBeenCalledWith(cv.data.meta.id, cropped, undefined)
    wrapper.unmount()
  })

  it('stores nothing when the crop is cancelled', async () => {
    const cv = useCvStore()
    const wrapper = mount(StepPersonal, { attachTo: document.body })
    await dropOn(wrapper, new File([new Uint8Array(1024)], 'me.png', { type: 'image/png' }))
    await vi.waitFor(() => expect(wrapper.find('dialog').attributes('open')).toBeDefined())

    await wrapper.findAll('dialog button').find((b) => b.text() === 'Cancelar')!.trigger('click')
    expect(wrapper.find('dialog').attributes('open')).toBeUndefined()
    expect(savePhoto).not.toHaveBeenCalled()
    expect(cv.data.personal.photo).toBeUndefined()
    wrapper.unmount()
  })
})
