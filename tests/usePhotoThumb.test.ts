// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'

const blobs = new Map<string, Blob | Promise<Blob>>()
vi.mock('@/services/storage', () => ({ loadPhoto: async (id: string) => blobs.get(id) }))

const { usePhotoThumb } = await import('@/composables/usePhotoThumb')

const created: string[] = []
const revoked: string[] = []

beforeEach(() => {
  blobs.clear()
  created.length = 0
  revoked.length = 0
  let n = 0
  URL.createObjectURL = () => {
    const url = `blob:test/${++n}`
    created.push(url)
    return url
  }
  URL.revokeObjectURL = (url: string) => void revoked.push(url)
})

const flush = async () => {
  for (let i = 0; i < 5; i++) await Promise.resolve()
  await nextTick()
}

function setup(initial?: string) {
  const reference = ref<string | undefined>(initial)
  let api!: ReturnType<typeof usePhotoThumb>
  const wrapper = mount(defineComponent({ setup() { api = usePhotoThumb(() => reference.value); return () => null } }))
  return { reference, api, wrapper }
}

describe('usePhotoThumb', () => {
  it('loads the photo behind a photo: reference and ignores anything else', async () => {
    blobs.set('photo:a', new Blob(['x']))
    const { api } = setup('photo:a')
    await flush()
    expect(api.thumbUrl.value).toBe('blob:test/1')

    const none = setup(undefined)
    await flush()
    expect(none.api.thumbUrl.value).toBeNull()
    const external = setup('https://example.com/me.png')
    await flush()
    expect(external.api.thumbUrl.value).toBeNull()
  })

  it('revokes the previous URL when the reference changes and on unmount', async () => {
    blobs.set('photo:a', new Blob(['a']))
    blobs.set('photo:b', new Blob(['b']))
    const { reference, api, wrapper } = setup('photo:a')
    await flush()
    reference.value = 'photo:b'
    await flush()
    expect(api.thumbUrl.value).toBe('blob:test/2')
    expect(revoked).toEqual(['blob:test/1'])

    wrapper.unmount()
    expect(revoked).toEqual(['blob:test/1', 'blob:test/2'])
  })

  it('never lets a slow, stale read overwrite a newer one', async () => {
    let release!: (b: Blob) => void
    blobs.set('photo:slow', new Promise<Blob>((resolve) => (release = resolve)))
    blobs.set('photo:fast', new Blob(['f']))
    const { reference, api } = setup('photo:slow')
    reference.value = 'photo:fast'
    await flush()
    expect(api.thumbUrl.value).toBe('blob:test/1')

    release(new Blob(['s']))
    await flush()
    expect(api.thumbUrl.value).toBe('blob:test/1')
    expect(revoked).toContain('blob:test/2') // the stale URL was created and immediately revoked
  })

  it('treats a failed read as no thumbnail, not as an error', async () => {
    blobs.set('photo:bad', Promise.reject(new Error('boom')) as unknown as Promise<Blob>)
    const { api } = setup('photo:bad')
    await flush()
    expect(api.thumbUrl.value).toBeNull()
  })
})
