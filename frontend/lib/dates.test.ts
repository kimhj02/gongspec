import { describe, expect, it } from 'vitest'
import { dateKey, ddayLabel, diffInDays, formatKoreanDate, formatKoreanRange, formatSchedulePeriod, isOnDay, upcomingSchedules } from './dates'

describe('dates', () => {
  it('formats a date key with zero padding', () => {
    expect(dateKey(new Date(2026, 8, 8))).toBe('2026-09-08')
  })

  it('builds d-day labels', () => {
    expect(ddayLabel(0)).toBe('D-Day')
    expect(ddayLabel(7)).toBe('D-7')
    expect(ddayLabel(-2)).toBe('D+2')
  })

  it('hides past schedules and sorts upcoming ones', () => {
    const upcoming = upcomingSchedules(
      [
        { id: 'past', title: '지난 일정', date: '2020-01-01', type: '개인' },
        { id: 'later', title: '면접', date: '2026-09-20', type: '지원' },
        { id: 'soon', title: '서류', date: '2026-09-10', type: '지원' },
      ],
      '2026-09-08',
    )

    expect(upcoming.map((item) => item.id)).toEqual(['soon', 'later'])
    expect(upcoming[0]?.daysLeft).toBe(2)
    expect(diffInDays('2026-09-08', '2026-09-08')).toBe(0)
  })

  it('treats a date range as one schedule that lasts until the end date', () => {
    const upcoming = upcomingSchedules(
      [{ id: 'range', title: '연수', date: '2026-09-01', endDate: '2026-09-10', type: '개인' }],
      '2026-09-08',
    )
    expect(upcoming).toHaveLength(1)
    expect(upcoming[0]?.daysLeft).toBe(0)
    expect(isOnDay({ date: '2026-09-10', endDate: '2026-09-12' }, '2026-09-11')).toBe(true)
    expect(isOnDay({ date: '2026-09-10', endDate: '2026-09-12' }, '2026-09-13')).toBe(false)
    expect(formatKoreanDate('2026-09-09')).toBe('2026년 9월 9일')
    expect(formatKoreanRange('2026-09-09', '2026-09-09', true)).toBe('2026년 9월 9일 → 2026년 9월 9일')
    expect(formatSchedulePeriod({ date: '2026-09-10', endDate: '2026-09-12' })).toBe('2026.09.10 ~ 2026.09.12')
  })
})
