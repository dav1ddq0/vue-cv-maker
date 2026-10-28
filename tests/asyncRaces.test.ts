// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { createSampleCV } from '@/core/sample'

/** Promises the test resolves by hand, in the order it chooses. */
function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((r) => (resolve = r))
  return { promise, resolve }
}

const loads = new Map<string, ReturnType<typeof deferred<unknown>>>()
const photos: ReturnType<typeof deferred<Blob | null>>[] = []
const decodes: ReturnType<typeof deferred<{ width: number; height: number }>>[] = []

vi.mock('@/templates/registry', () => ({
  getTemplate: (id: string) => ({
    component: () => {
      const load = deferred<unknown>()
      loads.set(id, load)
      return load.promise
    },
  }),
}))

vi.mock('@/services/storage', () => ({
  loadPhoto: () => {
    const read = deferred<Blob | null>()
    photos.push(read)
    return read.promise
  },
}))

vi.mock('@/services/photoCrop', () => ({
  decodePhoto: () => {
    const decode = deferred<{ width: number; height: number }>()
    decodes.push(decode)
    return decode.promise
  },
  rotate: (source: unknown) => source,
  sizeOf: (source: { width: number; height: number }) => source,
  drawCrop: vi.fn(),
  encodeCrop: vi.fn(),
}))

import CvRenderer from '@/components/preview/CvRenderer.vue'
import PhotoCropDialog from '@/components/form/PhotoCropDialog.vue'
import { encodeCrop } from '@/services/photoCrop'

const named = (name: string) => defineComponent({ render: () => h('p', { class: 'tpl' }, name) })

let created = 0
let revoked: string[] = []
beforeAll(() => {
  URL.createObjectURL = () => `blob:test/${++created}`
  URL.revokeObjectURL = (url: string) => void revoked.push(url)
  const proto = HTMLDialogElement.prototype
  proto.showModal = function (this: HTMLDialogElement) { this.setAttribute('open', '') }
  proto.close = function (this: HTMLDialogElement) { this.removeAttribute('open') }
})

afterEach(() => {
  loads.clear()
  photos.length = 0
  decodes.length = 0
  revoked = []
})

describe('CvRenderer races (spec 028)', () => {
  it('keeps the template picked last when an older load resolves later', async () => {
    const data = createSampleCV()
    delete data.personal.photo
    const wrapper = mount(CvRenderer, { props: { data, templateId: 'slow' } })
    await wrapper.setProps({ templateId: 'fast' })
    loads.get('fast')!.resolve(named('fast'))
    await flushPromises()
    loads.get('slow')!.resolve(named('slow'))
    await flushPromises()
    expect(wrapper.find('.tpl').text()).toBe('fast')
  })

  it('revokes the URL of a photo read that finishes after unmount', async () => {
    const data = createSampleCV()
    data.personal.photo = 'photo:cv1:1'
    const wrapper = mount(CvRenderer, { props: { data, templateId: 'a' } })
    expect(photos).toHaveLength(1)
    wrapper.unmount()
    photos[0]!.resolve(new Blob(['x']))
    await flushPromises()
    expect(revoked).toEqual([`blob:test/${created}`])
  })
})

describe('PhotoCropDialog races (spec 028)', () => {
  it('frames the photo given last when an older decode resolves later', async () => {
    const wrapper = mount(PhotoCropDialog, { props: { photo: null }, attachTo: document.body })
    await wrapper.setProps({ photo: new Blob(['first']) })
    await flushPromises()
    await wrapper.setProps({ photo: new Blob(['second']) })
    await flushPromises()
    expect(decodes).toHaveLength(2)
    decodes[1]!.resolve({ width: 100, height: 100 })
    await flushPromises()
    decodes[0]!.resolve({ width: 900, height: 300 })
    await flushPromises()
    await nextTick()
    await wrapper.findAll('button').find((b) => b.text() === 'Usar foto')!.trigger('click')
    await flushPromises()
    expect(vi.mocked(encodeCrop).mock.calls[0]![0]).toEqual({ width: 100, height: 100 })
    wrapper.unmount()
  })
})
