import type { Schedule } from '@/lib/api'

export const pad = (value: number) => String(value).padStart(2, '0')

export const dateKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export function monthDays(month: Date): (Date | null)[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells: (Date | null)[] = [
    ...Array(first.getDay()).fill(null),
    ...Array.from({ length: count }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1)),
  ]
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export function diffInDays(from: string, to: string) {
  const start = new Date(`${from}T00:00:00`)
  const end = new Date(`${to}T00:00:00`)
  return Math.round((end.getTime() - start.getTime()) / 86_400_000)
}

export function scheduleSpan(item: { date: string; endDate?: string }) {
  const start = item.date
  const end = item.endDate || item.date
  return start <= end ? { start, end } : { start: end, end: start }
}

export function isOnDay(item: { date: string; endDate?: string }, day: string) {
  const { start, end } = scheduleSpan(item)
  return day >= start && day <= end
}

export function formatKoreanDate(value: string) {
  const [year, month, day] = value.split('-')
  if (!year || !month || !day) return value
  return `${Number(year)}년 ${Number(month)}월 ${Number(day)}일`
}

export function formatKoreanRange(start: string, end?: string, rangeEnabled = false) {
  const from = formatKoreanDate(start)
  if (!rangeEnabled) return from
  if (!end) return `${from} → 종료일`
  return `${from} → ${formatKoreanDate(end)}`
}

export function formatSchedulePeriod(item: { date: string; endDate?: string }) {
  const { start, end } = scheduleSpan(item)
  const from = start.replaceAll('-', '.')
  if (start === end) return from
  return `${from} ~ ${end.replaceAll('-', '.')}`
}

export function addCalendarYears(date: string, years: number) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || years <= 0) return ''
  const next = new Date(`${date}T00:00:00`)
  if (Number.isNaN(next.getTime())) return ''
  next.setFullYear(next.getFullYear() + years)
  return dateKey(next)
}

export function validityYears(validity?: string) {
  if (!validity || validity === '영구') return 0
  const matched = validity.trim().match(/^(\d+)\s*년$/)
  return matched ? Number(matched[1]) : 0
}

export function expiresAtFrom(acquiredAt?: string, validity?: string) {
  return addCalendarYears(acquiredAt ?? '', validityYears(validity))
}

export function expiresAtDisplay(acquiredAt?: string, validity?: string) {
  const expires = expiresAtFrom(acquiredAt, validity)
  if (expires) return expires
  if (!validityYears(validity)) return '없음'
  return ''
}

export function ddayLabel(days: number) {
  if (days === 0) return 'D-Day'
  if (days > 0) return `D-${days}`
  return `D+${Math.abs(days)}`
}

export function upcomingSchedules(schedules: Schedule[], today = dateKey(new Date()), limit = 5) {
  return schedules
    .filter((item) => scheduleSpan(item).end >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title))
    .slice(0, limit)
    .map((item) => {
      const { start } = scheduleSpan(item)
      const daysLeft = start >= today ? diffInDays(today, start) : 0
      return { ...item, daysLeft }
    })
}
