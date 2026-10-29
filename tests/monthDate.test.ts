import { describe, expect, it } from 'vitest'
import { isPlausibleYear, joinMonth, splitMonth } from '@/core/monthDate'

describe('month dates (spec 042)', () => {
  it('splits a stored value into its year and month', () => {
    expect(splitMonth('2022-03')).toEqual({ year: '2022', month: '03' })
    expect(splitMonth('2021')).toEqual({ year: '2021', month: '' })
  })

  it('takes anything that is not one of the two shapes for nothing', () => {
    for (const value of ['', 'marzo', '2022-3', '22-03', '2022-03-01', '2022/03']) {
      expect(splitMonth(value)).toEqual({ year: '', month: '' })
    }
  })

  it('accepts the years from 1900 to 2100 and no others', () => {
    expect(['1899', '1900', '2100', '2101', '0000', '202', '20245', 'abcd'].map(isPlausibleYear)).toEqual([false, true, true, false, false, false, false, false])
  })

  it('joins a year and a month, a year alone, and nothing when the year is not plausible', () => {
    expect(joinMonth('2022', '03')).toBe('2022-03')
    expect(joinMonth('2022', '')).toBe('2022')
    expect(joinMonth('', '03')).toBe('')
    expect(joinMonth('1850', '03')).toBe('')
  })

  it('gives back what it took apart', () => {
    for (const value of ['', '2022', '2022-03']) {
      const { year, month } = splitMonth(value)
      expect(joinMonth(year, month)).toBe(value)
    }
  })
})
