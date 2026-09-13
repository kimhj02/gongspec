import { describe, expect, it } from 'vitest'
import { chunkWeeks, layoutWeekEvents } from './calendar-layout'
import { monthDays } from './dates'

describe('calendar layout', () => {
  it('places a 3-day schedule on one connected segment', () => {
    const week = monthDays(new Date(2026, 8, 1)).slice(7, 14)
    const { segments } = layoutWeekEvents(week, [
      { id: '1', title: '연수', date: '2026-09-10', endDate: '2026-09-12', type: '개인', source: 'schedule' },
    ])

    expect(segments).toHaveLength(1)
    expect(segments[0]).toMatchObject({ startCol: 4, endCol: 6, lane: 0 })
  })

  it('splits a range that crosses into the next week', () => {
    const weeks = chunkWeeks(monthDays(new Date(2026, 8, 1)))
    const first = layoutWeekEvents(weeks[1] ?? [], [
      { id: '1', title: '연수', date: '2026-09-12', endDate: '2026-09-14', type: '개인', source: 'schedule' },
    ])
    const second = layoutWeekEvents(weeks[2] ?? [], [
      { id: '1', title: '연수', date: '2026-09-12', endDate: '2026-09-14', type: '개인', source: 'schedule' },
    ])

    expect(first.segments).toHaveLength(1)
    expect(first.segments[0]).toMatchObject({ startCol: 6, endCol: 6, continuesRight: true })
    expect(second.segments).toHaveLength(1)
    expect(second.segments[0]).toMatchObject({ startCol: 0, endCol: 1, continuesLeft: true })
  })

  it('stacks overlapping events on separate lanes', () => {
    const week = monthDays(new Date(2026, 8, 1)).slice(7, 14)
    const { segments } = layoutWeekEvents(week, [
      { id: '1', title: '연수', date: '2026-09-10', endDate: '2026-09-12', type: '개인', source: 'schedule' },
      { id: '2', title: '면접', date: '2026-09-11', type: '면접', source: 'application' },
    ])

    expect(segments.find((item) => item.event.id === '1')?.lane).toBe(0)
    expect(segments.find((item) => item.event.id === '2')?.lane).toBe(1)
  })

  it('keeps a midweek event on the first lane beside a later holiday bar', () => {
    const week = monthDays(new Date(2026, 8, 1)).slice(21, 28)
    const { segments } = layoutWeekEvents(week, [
      { id: 'holiday-1', title: '추석', date: '2026-09-24', endDate: '2026-09-26', type: '개인', source: 'holiday' },
      { id: 'exam', title: '하반기 4직급', date: '2026-09-23', type: '서류', source: 'application' },
    ])

    expect(segments.find((item) => item.event.id === 'exam')).toMatchObject({ startCol: 3, lane: 0 })
    expect(segments.find((item) => item.event.id === 'holiday-1')).toMatchObject({ startCol: 4, endCol: 6, lane: 0 })
  })
})
