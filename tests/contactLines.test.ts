import { describe, expect, it } from 'vitest'
import { createEmptyCV } from '@/core/factory'
import { contactLines, formatBirthDate, maritalLabel } from '@/templates/shared'
import { MARITAL_STATUSES } from '@/types/cv'

const cv = (language = 'es') => {
  const data = createEmptyCV()
  data.meta.language = language
  return data
}

describe('formatBirthDate', () => {
  it('formats a full ISO date in the content language', () => {
    expect(formatBirthDate('1992-03-12', 'es')).toBe('12 mar 1992')
    expect(formatBirthDate('1992-03-02', 'en')).toBe('2 Mar 1992')
  })

  it('shows anything else as typed, never as an invalid date', () => {
    expect(formatBirthDate('1992', 'es')).toBe('1992')
    expect(formatBirthDate('12/03/1992', 'es')).toBe('12/03/1992')
    expect(formatBirthDate('1992-13-40', 'es')).toBe('1992-13-40')
    expect(formatBirthDate('  ', 'es')).toBe('')
  })
})

describe('contactLines', () => {
  it('is just the basics, in order, for a CV without extras', () => {
    const data = cv()
    Object.assign(data.personal, { email: 'a@b.co', phone: '123', location: 'Valencia' })
    expect(contactLines(data)).toEqual(['a@b.co', '123', 'Valencia'])
  })

  it('adds each filled extra with a label in the content language', () => {
    const es = cv('es')
    Object.assign(es.personal, { birthDate: '1992-03-12', nationality: 'Española', drivingLicense: 'B', maritalStatus: 'married' })
    expect(contactLines(es)).toEqual([
      'Nacimiento: 12 mar 1992',
      'Nacionalidad: Española',
      'Carné de conducir: B',
      'Estado civil: Casado/a',
    ])

    const en = cv('en')
    Object.assign(en.personal, { birthPlace: 'Leeds', maritalStatus: 'partner' })
    expect(contactLines(en)).toEqual(['Born: Leeds', 'Marital status: Domestic partnership'])
  })

  it('joins date and place and trims whitespace-only values away', () => {
    const data = cv()
    Object.assign(data.personal, { birthDate: '1992-03-12', birthPlace: 'Valencia', nationality: '   ', drivingLicense: ' ' })
    expect(contactLines(data)).toEqual(['Nacimiento: 12 mar 1992, Valencia'])
  })

  it('falls back to Spanish labels for an unknown language', () => {
    const data = cv('xx')
    data.personal.nationality = 'Peruana'
    expect(contactLines(data)).toEqual(['Nacionalidad: Peruana'])
  })
})

describe('maritalLabel', () => {
  it('has a label for every status in both languages', () => {
    for (const language of ['es', 'en']) {
      for (const status of MARITAL_STATUSES) expect(maritalLabel(status, language).length).toBeGreaterThan(0)
    }
  })
})
