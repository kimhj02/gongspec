import { describe, expect, it } from 'vitest'
import { holidayEventsFrom, holidayMapFrom } from './korean-holidays'

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

  it('joins consecutive public holidays into one event', () => {
    const events = holidayEventsFrom({
      '2026-09-24': '추석',
      '2026-09-25': '추석',
      '2026-09-26': '추석',
      '2026-12-25': '크리스마스',
    })

    expect(events).toEqual([
      { id: 'holiday-2026-09-24', title: '추석', date: '2026-09-24', endDate: '2026-09-26', type: '개인', source: 'holiday' },
      { id: 'holiday-2026-12-25', title: '크리스마스', date: '2026-12-25', type: '개인', source: 'holiday' },
    ])
  })

  it('keeps consecutive holidays with different names on one bar', () => {
    const events = holidayEventsFrom({
      '2026-05-05': '어린이날',
      '2026-05-06': '대체공휴일',
    })

    expect(events).toEqual([
      { id: 'holiday-2026-05-05', title: '어린이날 · 대체공휴일', date: '2026-05-05', endDate: '2026-05-06', type: '개인', source: 'holiday' },
    ])
  })
})
