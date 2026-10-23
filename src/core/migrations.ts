import { SCHEMA_VERSION, SECTION_IDS } from '@/types/cv'
import type { CVData } from '@/types/cv'
import { createEmptyCV, DEFAULT_STYLE } from './factory'
import { uid } from './id'

/**
 * Migration steps, keyed by the version they upgrade *from*. A file at version N
 * is run through steps N, N+1, … until it reaches `SCHEMA_VERSION`.
 *
 * There are no steps yet (v1 is the first schema); the pipeline exists so the
 * first real migration is a one-line addition instead of a refactor.
 */
const steps: Record<number, (data: any) => any> = {}

export class UnsupportedSchemaError extends Error {
  constructor(readonly found: number) {
    super(`Unsupported schemaVersion: ${found}`)
    this.name = 'UnsupportedSchemaError'
  }
}

/**
 * Brings an arbitrary parsed JSON object up to the current schema and fills in
 * every missing field. Import must never produce a half-shaped `CVData`: a
 * template that crashes on a missing array is a worse failure than a lossy import.
 */
export function migrate(input: unknown): CVData {
  if (!input || typeof input !== 'object') throw new UnsupportedSchemaError(0)
  let data = structuredClone(input) as any

  let version = Number(data.schemaVersion) || 1
  if (version > SCHEMA_VERSION) throw new UnsupportedSchemaError(version)
  while (version < SCHEMA_VERSION) {
    const step = steps[version]
    if (!step) throw new UnsupportedSchemaError(version)
    data = step(data)
    version += 1
  }

  return normalize(data)
}

/** Fills defaults and re-issues missing ids so every list item is keyable. */
export function normalize(input: any): CVData {
  const base = createEmptyCV()
  const out: CVData = {
    schemaVersion: SCHEMA_VERSION,
    meta: { ...base.meta, ...(input.meta ?? {}) },
    personal: {
      ...base.personal,
      ...(input.personal ?? {}),
      links: withIds(input.personal?.links, 'lnk'),
    },
    summary: str(input.summary),
    experience: withIds(input.experience, 'exp').map((e: any) => ({
      ...e,
      endDate: e.endDate ?? null,
      highlights: Array.isArray(e.highlights) ? e.highlights.map(str) : [],
      description: str(e.description),
    })),
    education: withIds(input.education, 'edu').map((e: any) => ({
      ...e,
      endDate: e.endDate ?? '',
    })),
    skills: withIds(input.skills, 'skg').map((g: any) => ({
      ...g,
      items: Array.isArray(g.items) ? g.items.map(str) : [],
    })),
    languages: withIds(input.languages, 'lng'),
    customSections: withIds(input.customSections, 'cus').map((s: any) => ({
      ...s,
      title: str(s.title),
      entries: withIds(s.entries, 'cen'),
    })),
    sectionOrder: [],
    style: { ...DEFAULT_STYLE, ...(input.style ?? {}) },
  }

  out.meta.id ||= uid('cv')
  out.style.fontScale = clamp(Number(out.style.fontScale) || 1, 0.85, 1.15)
  out.style.spacingScale = clamp(Number(out.style.spacingScale) || 1, 0.85, 1.3)
  out.sectionOrder = reconcileOrder(input.sectionOrder, out)
  return out
}

/**
 * Keeps the stored order but drops ids that no longer exist and appends sections
 * the file didn't know about — so an old export never hides a newer section.
 */
export function reconcileOrder(stored: unknown, data: CVData): string[] {
  const valid = new Set<string>([...SECTION_IDS, ...data.customSections.map((s) => s.id)])
  const kept = Array.isArray(stored) ? stored.filter((id) => typeof id === 'string' && valid.has(id)) : []
  const seen = new Set(kept)
  return [...kept, ...[...valid].filter((id) => !seen.has(id))]
}

function withIds(list: unknown, prefix: string): any[] {
  if (!Array.isArray(list)) return []
  return list
    .filter((item) => item && typeof item === 'object')
    .map((item: any) => ({ ...item, id: typeof item.id === 'string' && item.id ? item.id : uid(prefix) }))
}

const str = (v: unknown) => (typeof v === 'string' ? v : '')
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
