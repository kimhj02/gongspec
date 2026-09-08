import { describe, expect, it } from 'vitest'
import { eventsFromApplication, mergeCalendarEvents } from './calendar-events'
import type { Resource } from './api'

const application: Resource = {
  id: 'app-1',
  tab: 'applications',
  title: '서울시 9급',
  subtitle: '서울시',
  details: {
    documentAt: '2026-09-10',
    writtenAt: '20260920',
    interviewAt: '2026.10.05',
    homepage: 'https://example.com',
  },
}

describe('calendar events', () => {
  it('turns application document/written/interview dates into calendar events', () => {
    const events = eventsFromApplication(application)
    expect(events.map((item) => [item.date, item.type, item.stage])).toEqual([
      ['2026-09-10', '서류', '서류마감'],
      ['2026-09-20', '필기', '필기'],
      ['2026-10-05', '면접', '면접'],
    ])
    expect(events.every((item) => item.source === 'application')).toBe(true)
  })

  it('merges registered schedules with application dates', () => {
    const events = mergeCalendarEvents(
      [{ id: 's1', title: '스터디', date: '2026-09-12', type: '개인' }],
      [application],
    )
    expect(events.map((item) => item.title)).toEqual(['서울시 9급 서류마감', '스터디', '서울시 9급 필기', '서울시 9급 면접'])
  })
})
