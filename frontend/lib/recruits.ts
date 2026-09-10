import { dateKey, ddayLabel, diffInDays, formatKoreanDate } from '@/lib/dates'
import type { PublicRecruit } from '@/lib/api'

export function alioDateKey(value?: string) {
  const digits = (value ?? '').replace(/\D/g, '')
  if (digits.length < 8) return ''
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`
}

export function recruitPeriodLabel(start?: string, end?: string) {
  const from = alioDateKey(start)
  const to = alioDateKey(end)
  if (!from && !to) return ''
  if (from && to && from !== to) return `${formatKoreanDate(from)} → ${formatKoreanDate(to)}`
  return formatKoreanDate(from || to)
}

export function recruitPeriodCompact(start?: string, end?: string) {
  const from = alioDateKey(start).replaceAll('-', '.')
  const to = alioDateKey(end).replaceAll('-', '.')
  if (!from && !to) return '-'
  if (from && to && from !== to) return `${from} ~ ${to}`
  return from || to
}

export function recruitDday(end?: string, today = dateKey(new Date())) {
  const to = alioDateKey(end)
  if (!to) return ''
  return ddayLabel(diffInDays(today, to))
}

export function sortRecruitsByDeadline(items: PublicRecruit[], today = dateKey(new Date())) {
  return [...items].sort((left, right) => {
    const leftEnd = alioDateKey(left.pbancEndYmd)
    const rightEnd = alioDateKey(right.pbancEndYmd)
    const leftUpcoming = Boolean(leftEnd && leftEnd >= today)
    const rightUpcoming = Boolean(rightEnd && rightEnd >= today)
    if (leftUpcoming !== rightUpcoming) return leftUpcoming ? -1 : 1
    if (leftUpcoming && rightUpcoming) return leftEnd.localeCompare(rightEnd)
    if (leftEnd && rightEnd) return rightEnd.localeCompare(leftEnd)
    if (leftEnd) return -1
    if (rightEnd) return 1
    return (left.title || '').localeCompare(right.title || '', 'ko')
  })
}

export function hireTypeTags(hireTypes?: string) {
  return (hireTypes ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

const applicationCategories = ['정규직', '계약직', '인턴'] as const

function isApplicationCategory(value: string): value is (typeof applicationCategories)[number] {
  return applicationCategories.includes(value as (typeof applicationCategories)[number])
}

function applicationCategoryFromRecruit(recruit: PublicRecruit) {
  if (isApplicationCategory(recruit.hireType)) return recruit.hireType
  return hireTypeTags(recruit.hireTypes).find(isApplicationCategory) ?? ''
}

export function applicationDraftFromRecruit(recruit: PublicRecruit) {
  const details: Record<string, string> = {}
  const institution = recruit.instNm?.trim() ?? ''
  const posting = recruit.title?.trim() ?? ''
  const homepage = recruit.srcUrl?.trim() ?? ''
  const documentAt = alioDateKey(recruit.pbancEndYmd)
  const category = applicationCategoryFromRecruit(recruit)
  if (institution) details.institution = institution
  if (posting) details.posting = posting
  if (homepage) details.homepage = homepage
  if (documentAt) details.documentAt = documentAt
  if (category) details.category = category
  return details
}
