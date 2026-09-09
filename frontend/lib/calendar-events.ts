import type { Resource, Schedule, ScheduleType } from '@/lib/api'
import { applicationPostingName, toDateInputValue } from '@/lib/resource-fields'

export type CalendarEvent = Schedule & {
  source: 'schedule' | 'application' | 'holiday'
  resourceId?: string
  stage?: string
}

export const applicationDateFields: { key: string; type: ScheduleType; stage: string }[] = [
  { key: 'documentAt', type: '서류', stage: '서류마감' },
  { key: 'documentAnnouncementAt', type: '서류', stage: '서류발표' },
  { key: 'writtenAt', type: '필기', stage: '필기' },
  { key: 'writtenAnnouncementAt', type: '필기', stage: '필기발표' },
  { key: 'interviewAt', type: '면접', stage: '1차면접' },
  { key: 'interviewAnnouncementAt', type: '면접', stage: '1차면접발표' },
  { key: 'interview2At', type: '면접', stage: '2차면접' },
  { key: 'interview2AnnouncementAt', type: '면접', stage: '2차면접발표' },
  { key: 'interview3At', type: '면접', stage: '3차면접' },
  { key: 'interview3AnnouncementAt', type: '면접', stage: '3차면접발표' },
]

export function eventTypeClass(type: string, source?: CalendarEvent['source']) {
  if (source === 'holiday') return 'holiday'
  if (type === '서류' || type === '지원') return 'document'
  if (type === '필기') return 'written'
  if (type === '면접') return 'interview'
  return 'personal'
}

export function eventsFromApplication(resource: Resource): CalendarEvent[] {
  if (resource.tab !== 'applications') return []
  const details = resource.details ?? {}
  const name = applicationPostingName(resource)
  return applicationDateFields.flatMap((field) => {
    const date = toDateInputValue(details[field.key])
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return []
    return [
      {
        id: `app-${resource.id}-${field.key}`,
        title: `${name} ${field.stage}`,
        date,
        type: field.type,
        source: 'application' as const,
        resourceId: resource.id,
        stage: field.stage,
      },
    ]
  })
}

export function mergeCalendarEvents(schedules: Schedule[], applications: Resource[]): CalendarEvent[] {
  const fromSchedules: CalendarEvent[] = schedules.map((item) => ({ ...item, source: 'schedule' }))
  const fromApplications = applications.flatMap(eventsFromApplication)
  return [...fromSchedules, ...fromApplications].sort(
    (a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title),
  )
}
