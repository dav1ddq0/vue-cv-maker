// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/services/storage', async (original) => ({
  ...(await original<typeof import('@/services/storage')>()),
  savePhoto: vi.fn(async () => 'photo:cv_test'),
}))

import { savePhoto } from '@/services/storage'
import StepPersonal from '@/components/form/StepPersonal.vue'
import { useCvStore } from '@/stores/cv'

beforeEach(() => {
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

  it('stores a photo within the limit', async () => {
    const cv = useCvStore()
    const wrapper = mount(StepPersonal)
    await dropOn(wrapper, new File([new Uint8Array(1024)], 'me.png', { type: 'image/png' }))
    await vi.waitFor(() => expect(cv.data.personal.photo).toBe('photo:cv_test'))
  })
})
