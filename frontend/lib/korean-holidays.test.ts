import { describe, expect, it } from 'vitest'
import { holidayMapFrom } from './korean-holidays'

describe('korean holidays', () => {
  it('maps public holidays by date', () => {
    const map = holidayMapFrom([
      { date: '2026-09-24', localName: '추석', types: ['Public'] },
      { date: '2026-09-25', localName: '추석', types: ['Public'] },
      { date: '2026-12-25', localName: '크리스마스', types: ['Public'] },
      { date: '2026-01-02', localName: '회사 휴무', types: ['Optional'] },
    ])

    expect(map['2026-09-25']).toBe('추석')
    expect(map['2026-12-25']).toBe('크리스마스')
    expect(map['2026-01-02']).toBeUndefined()
  })
})
