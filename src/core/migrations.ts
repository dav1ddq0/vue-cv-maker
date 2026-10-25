import { MARITAL_STATUSES, SCHEMA_VERSION, SECTION_IDS } from '@/types/cv'
import type { CVData, MaritalStatus, SkillItem, StyleTokens } from '@/types/cv'
import { createEmptyCV, DEFAULT_STYLE, DEFAULT_TEMPLATE_ID } from './factory'
import { uid } from './id'
import { isAccentColor, isFontOption, isPageMargin } from './stylePresets'

/**
 * Migration steps, keyed by the version they upgrade *from*. A file at version N
 * is run through steps N, N+1, … until it reaches `SCHEMA_VERSION`.
 *
 * v1 → v2: skill items went from plain strings to `{ name, level? }`.
 * v2 → v3: optional personal extras (birth date and place, nationality, licence, marital status).
 * v3 → v4: `meta.templateId`. The value itself is filled by `normalize` from `MigrateOptions`, because
 *          only the caller knows which template the CV used to be shown in (spec 021).
 * v4 → v5: `pageBreaks`, the sections that start on a new page (spec 022).
 */
const steps: Record<number, (data: any) => any> = {
  1: (data) => ({
    ...data,
    schemaVersion: 2,
    skills: Array.isArray(data.skills)
      ? data.skills.map((group: any) => ({
          ...group,
          items: Array.isArray(group?.items)
            ? group.items.map((item: unknown) => (typeof item === 'string' ? { name: item } : item))
            : [],
        }))
      : data.skills,
  }),
  2: (data) => ({
    ...data,
    schemaVersion: 3,
    personal: {
      birthDate: '',
      birthPlace: '',
      nationality: '',
      drivingLicense: '',
      maritalStatus: '',
      ...(data.personal && typeof data.personal === 'object' ? data.personal : {}),
    },
  }),
  3: (data) => ({ ...data, schemaVersion: 4 }),
  4: (data) => ({ ...data, schemaVersion: 5, pageBreaks: [] }),
}

export interface MigrateOptions {
  /** Template for a CV that does not name one; before spec 021 that was the global last pick. */
  fallbackTemplateId?: string
}

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
export function migrate(input: unknown, options: MigrateOptions = {}): CVData {
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

  return normalize(data, options)
}

/** Fills defaults and re-issues missing ids so every list item is keyable. */
export function normalize(input: any, options: MigrateOptions = {}): CVData {
  const base = createEmptyCV()
  const out: CVData = {
    schemaVersion: SCHEMA_VERSION,
    meta: {
      ...base.meta,
      ...(input.meta ?? {}),
      templateId: str(input.meta?.templateId) || options.fallbackTemplateId || DEFAULT_TEMPLATE_ID,
    },
    personal: {
      ...base.personal,
      ...(input.personal ?? {}),
      fullName: str(input.personal?.fullName),
      headline: str(input.personal?.headline),
      email: str(input.personal?.email),
      phone: str(input.personal?.phone),
      location: str(input.personal?.location),
      photo: toPhoto(input.personal?.photo),
      birthDate: str(input.personal?.birthDate),
      birthPlace: str(input.personal?.birthPlace),
      nationality: str(input.personal?.nationality),
      drivingLicense: str(input.personal?.drivingLicense),
      maritalStatus: toMaritalStatus(input.personal?.maritalStatus),
      links: withIds(input.personal?.links, 'lnk').map((link: any) => ({
        ...link,
        label: str(link.label),
        url: str(link.url),
      })),
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
      items: Array.isArray(g.items) ? g.items.map(toSkillItem) : [],
    })),
    languages: withIds(input.languages, 'lng'),
    customSections: withIds(input.customSections, 'cus').map((s: any) => ({
      ...s,
      title: str(s.title),
      entries: withIds(s.entries, 'cen'),
    })),
    sectionOrder: [],
    pageBreaks: [],
    style: toStyle(input.style),
  }
  if (out.personal.photo === undefined) delete out.personal.photo

  out.meta.id ||= uid('cv')
  out.style.fontScale = clamp(Number(out.style.fontScale) || 1, 0.85, 1.15)
  out.style.spacingScale = clamp(Number(out.style.spacingScale) || 1, 0.85, 1.3)
  out.sectionOrder = reconcileOrder(input.sectionOrder, out)
  out.pageBreaks = toPageBreaks(input.pageBreaks, out.sectionOrder)
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

/**
 * Style values reach CSS variables and the exported HTML, so only values the style step itself can
 * produce are kept; anything else — e.g. `url(https://…)`, which made the browser contact a third
 * party when the CV was opened — falls back to the default (spec 017).
 */
function toStyle(value: unknown): StyleTokens {
  const style: any = value && typeof value === 'object' ? value : {}
  return {
    ...DEFAULT_STYLE,
    ...style,
    accentColor: isAccentColor(style.accentColor) ? style.accentColor : DEFAULT_STYLE.accentColor,
    fontFamily: isFontOption(style.fontFamily) ? style.fontFamily : DEFAULT_STYLE.fontFamily,
    pageMargin: isPageMargin(style.pageMargin) ? style.pageMargin : DEFAULT_STYLE.pageMargin,
  }
}

/** Only ids of sections the CV has, once each; a break before a removed section means nothing. */
function toPageBreaks(value: unknown, order: string[]): string[] {
  if (!Array.isArray(value)) return []
  return order.filter((id) => value.includes(id))
}

/** A stored photo is an IndexedDB reference or an inline raster image; never a remote URL or SVG. */
function toPhoto(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  if (value.startsWith('photo:')) return value
  return /^data:image\/(?:png|jpeg|webp|gif);base64,/i.test(value) ? value : undefined
}

/** Anything that is not one of the known codes (a typo, a label from elsewhere) becomes empty. */
function toMaritalStatus(value: unknown): MaritalStatus | '' {
  return (MARITAL_STATUSES as readonly unknown[]).includes(value) ? (value as MaritalStatus) : ''
}

function withIds(list: unknown, prefix: string): any[] {
  if (!Array.isArray(list)) return []
  return list
    .filter((item) => item && typeof item === 'object')
    .map((item: any) => ({ ...item, id: typeof item.id === 'string' && item.id ? item.id : uid(prefix) }))
}

/**
 * Normalizes a v2 skill item; keeps `level` only when it is an integer 1–5. The legacy
 * string form is converted by the v1 → v2 step, not here, so that step owns that format.
 */
function toSkillItem(value: unknown): SkillItem {
  if (!value || typeof value !== 'object') return { name: '' }
  const { name, level } = value as { name?: unknown; level?: unknown }
  const valid = typeof level === 'number' && Number.isInteger(level) && level >= 1 && level <= 5
  return valid ? { name: str(name), level } : { name: str(name) }
}

const str = (v: unknown) => (typeof v === 'string' ? v : '')
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
