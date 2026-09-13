import { describe, expect, it } from 'vitest'
import { eventsFromApplication, mergeCalendarEvents } from './calendar-events'
import type { Resource } from './api'

const application: Resource = {
  id: 'app-1',
  tab: 'applications',
  title: '서울시 9급',
  subtitle: '서울시',
  details: {
    institution: '서울교통공사',
    posting: '서울시 9급',
    documentAt: '2026-09-10',
    writtenAt: '20260920',
    interviewAt: '2026.10.05',
    homepage: 'https://example.com',
  },
}

describe('calendar events', () => {
  it('turns application document/written/interview dates into calendar events', () => {
    const events = eventsFromApplication(application)
    expect(events.map((item) => [item.date, item.type, item.stage, item.title])).toEqual([
      ['2026-09-10', '서류', '접수마감', '(접수마감) 서울교통공사'],
      ['2026-09-20', '필기', '필기시험', '(필기시험) 서울교통공사'],
      ['2026-10-05', '면접', '면접1차', '(면접1차) 서울교통공사'],
    ])
    expect(events.every((item) => item.source === 'application')).toBe(true)
  })

  it('turns second and third interview dates into calendar events', () => {
    const events = eventsFromApplication({
      ...application,
      details: { institution: '서울교통공사', interview2At: '2026-10-12', interview3At: '2026-10-20' },
    })
    expect(events.map((item) => [item.date, item.stage, item.title])).toEqual([
      ['2026-10-12', '면접2차', '(면접2차) 서울교통공사'],
      ['2026-10-20', '면접3차', '(면접3차) 서울교통공사'],
    ])
  })

  it('labels announcement dates so they are distinct from exam days', () => {
    const events = eventsFromApplication({
      ...application,
      details: {
        institution: '서울교통공사',
        documentAnnouncementAt: '2026-09-15',
        writtenAnnouncementAt: '2026-09-25',
        interviewAnnouncementAt: '2026-10-08',
      },
    })
    expect(events.map((item) => item.title)).toEqual([
      '(서류발표) 서울교통공사',
      '(필기발표) 서울교통공사',
      '(면접발표) 서울교통공사',
    ])
  })

  it('falls back to the posting name when the company is missing', () => {
    expect(
      eventsFromApplication({
        ...application,
        subtitle: '',
        details: { posting: '9급 행정직', documentAt: '2026-09-10' },
      }).map((item) => item.title),
    ).toEqual(['(접수마감) 9급 행정직'])
  })

  it('merges registered schedules with application dates', () => {
    const events = mergeCalendarEvents(
      [{ id: 's1', title: '스터디', date: '2026-09-12', type: '개인' }],
      [application],
    )
    expect(events.map((item) => item.title)).toEqual([
      '(접수마감) 서울교통공사',
      '스터디',
      '(필기시험) 서울교통공사',
      '(면접1차) 서울교통공사',
    ])
  })
})
