import type { CalendarEvent } from '@/lib/calendar-events'
import { dateKey, scheduleSpan } from '@/lib/dates'

export const VISIBLE_EVENT_LANES = 3

export type WeekSegment = {
  event: CalendarEvent
  lane: number
  startCol: number
  endCol: number
  continuesLeft: boolean
  continuesRight: boolean
}

export function chunkWeeks<T>(days: T[], size = 7) {
  const weeks: T[][] = []
  for (let index = 0; index < days.length; index += size) weeks.push(days.slice(index, index + size))
  return weeks
}

export function layoutWeekEvents(week: (Date | null)[], events: CalendarEvent[], maxLanes = VISIBLE_EVENT_LANES) {
  const keys = week.map((day) => (day ? dateKey(day) : null))
  const candidates = events
    .map((event) => {
      const clipped = clipToWeek(keys, event)
      return clipped ? { event, ...clipped } : null
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((a, b) => {
      if (a.startCol !== b.startCol) return a.startCol - b.startCol
      if (a.endCol !== b.endCol) return b.endCol - a.endCol
      return a.event.title.localeCompare(b.event.title)
    })

  const laneEnds: number[] = []
  const segments: WeekSegment[] = []
  const overflowByCol = Array.from({ length: week.length }, () => 0)

  for (const item of candidates) {
    let lane = laneEnds.findIndex((end) => end < item.startCol)
    if (lane === -1) {
      if (laneEnds.length >= maxLanes) {
        for (let col = item.startCol; col <= item.endCol; col++) overflowByCol[col] += 1
        continue
      }
      lane = laneEnds.length
      laneEnds.push(-1)
    }
    laneEnds[lane] = item.endCol
    segments.push({
      event: item.event,
      lane,
      startCol: item.startCol,
      endCol: item.endCol,
      continuesLeft: item.continuesLeft,
      continuesRight: item.continuesRight,
    })
  }

  return { segments, overflowByCol }
}

function clipToWeek(keys: (string | null)[], event: CalendarEvent) {
  const { start, end } = scheduleSpan(event)
  let startCol = -1
  let endCol = -1
  keys.forEach((key, index) => {
    if (!key || key < start || key > end) return
    if (startCol === -1) startCol = index
    endCol = index
  })
  if (startCol === -1 || endCol === -1) return null
  const firstKey = keys[startCol]
  const lastKey = keys[endCol]
  return {
    startCol,
    endCol,
    continuesLeft: Boolean(firstKey && start < firstKey),
    continuesRight: Boolean(lastKey && end > lastKey),
  }
}
