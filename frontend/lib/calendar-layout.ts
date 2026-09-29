/** 기간 일정을 주 단위로 잘라 겹치지 않는 행에 배치하고, 표시 한도를 넘는 일정은 날짜별로 기록한다. */
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
  // 주 경계로 자른 뒤 시작 위치·기간 길이·공휴일 여부·제목 순으로 배치 우선순위를 결정한다.
  const candidates = events
    .map((event) => {
      const clipped = clipToWeek(keys, event)
      return clipped ? { event, ...clipped } : null
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((a, b) => {
      if (a.startCol !== b.startCol) return a.startCol - b.startCol
      if (a.endCol !== b.endCol) return b.endCol - a.endCol
      const holidayA = a.event.source === 'holiday' ? 0 : 1
      const holidayB = b.event.source === 'holiday' ? 0 : 1
      if (holidayA !== holidayB) return holidayA - holidayB
      return a.event.title.localeCompare(b.event.title)
    })

  const laneEnds: number[] = []
  const segments: WeekSegment[] = []
  const overflowByCol = Array.from({ length: week.length }, () => 0)
  const hiddenEventsByCol: CalendarEvent[][] = Array.from({ length: week.length }, () => [])

  for (const item of candidates) {
    // 앞 일정이 끝난 행을 재사용한다. 사용 가능한 행이 없으면 날짜별 숨김 목록에 넣는다.
    let lane = laneEnds.findIndex((end) => end < item.startCol)
    if (lane === -1) {
      if (laneEnds.length >= maxLanes) {
        for (let col = item.startCol; col <= item.endCol; col++) {
          overflowByCol[col] += 1
          hiddenEventsByCol[col].push(item.event)
        }
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

  return { segments, overflowByCol, hiddenEventsByCol }
}

// 한 일정이 여러 주에 걸치면 각 주의 구간과 좌우 이어짐 상태를 따로 계산한다.
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
