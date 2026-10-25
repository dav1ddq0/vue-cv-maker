import { ref, watch, type Ref } from 'vue'

/**
 * One entry of a list open at a time (spec 018): the first one at start, and an entry added later
 * opens by itself so the user lands in its fields. UI state only — never stored with the CV.
 */
export function useExpandedEntry(items: Ref<{ id: string }[]>) {
  const openId = ref<string | null>(items.value[0]?.id ?? null)

  watch(
    () => items.value.map((item) => item.id),
    (ids, previous) => {
      const added = ids.find((id) => !previous.includes(id))
      if (added) openId.value = added
    },
  )

  const isOpen = (id: string) => openId.value === id
  const toggle = (id: string) => {
    openId.value = openId.value === id ? null : id
  }

  return { isOpen, toggle }
}
