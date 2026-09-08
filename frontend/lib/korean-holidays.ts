import type { CalendarEvent } from '@/lib/calendar-events'
import { diffInDays } from '@/lib/dates'

export type HolidayMap = Record<string, string>

type HolidayItem = {
  date?: string
  localName?: string
  types?: string[]
}

export function holidayMapFrom(items: HolidayItem[]) {
  const map: HolidayMap = {}
  for (const item of items) {
    if (!item.date || !item.localName) continue
    if (item.types && !item.types.includes('Public')) continue
    map[item.date] = map[item.date] ? `${map[item.date]} · ${item.localName}` : item.localName
  }
  return map
}

export function holidayEventsFrom(map: HolidayMap): CalendarEvent[] {
  const dates = Object.keys(map).sort()
  const ranges: { start: string; end: string; names: string[] }[] = []

  for (const date of dates) {
    const name = map[date]
    const last = ranges.at(-1)
    if (last && diffInDays(last.end, date) === 1) {
      last.end = date
      if (!last.names.includes(name)) last.names.push(name)
      continue
    }
    ranges.push({ start: date, end: date, names: [name] })
  }

  return ranges.map((range) => ({
    id: `holiday-${range.start}`,
    title: range.names.join(' · '),
    date: range.start,
    endDate: range.end === range.start ? undefined : range.end,
    type: '개인',
    source: 'holiday',
  }))
}

export async function fetchKoreanHolidays(year: number): Promise<HolidayMap> {
  const response = await fetch(`/holiday-api/${year}`)
  if (!response.ok) throw new Error('공휴일을 불러오지 못했습니다.')
  return holidayMapFrom((await response.json()) as HolidayItem[])
}
