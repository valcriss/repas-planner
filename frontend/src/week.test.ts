import { describe, it, expect } from 'vitest'
import { weekRange, weekString } from './week'

describe('weekRange', () => {
  it('computes monday and sunday from ISO week string', () => {
    const { start, end } = weekRange('2024-W01')
    expect(start.toISOString().slice(0,10)).toBe('2024-01-01')
    expect(end.toISOString().slice(0,10)).toBe('2024-01-07')
  })

  it('handles weeks where Jan 4 is Sunday', () => {
    const { start, end } = weekRange('2015-W01')
    expect(start.toISOString().slice(0,10)).toBe('2014-12-29')
    expect(end.toISOString().slice(0,10)).toBe('2015-01-04')
  })

  it('formats week string from date', () => {
    const d = new Date(Date.UTC(2024,0,3))
    expect(weekString(d)).toBe('2024-W01')
  })

  it('handles years starting on Sunday', () => {
    const d = new Date(Date.UTC(2015,0,7))
    expect(weekString(d)).toBe('2015-W02')
  })
})
