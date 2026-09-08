import type { Resource, ResourceTab } from '@/lib/api'
import { expiresAtFrom, formatSchedulePeriod } from '@/lib/dates'

export type Field = {
  key: string
  label: string
  placeholder?: string
  type?: 'text' | 'date' | 'url' | 'textarea' | 'select' | 'daterange'
  options?: string[]
  rows?: number
  required?: boolean
  computed?: boolean
}

export type ApplicationStageId = 'document' | 'written' | 'interview'

const resultOptions = ['대기중', '합격', '불합격']

export const applicationCommonFields: Field[] = [
  { key: 'category', label: '구분', type: 'select', options: ['정규직', '계약직', '인턴', '기타'] },
  { key: 'institution', label: '기관명', placeholder: '기관명', required: true },
  { key: 'homepage', label: '지원 홈페이지', placeholder: '채용 사이트 주소 (선택)' },
]

export const applicationStages: { id: ApplicationStageId; label: string; fields: Field[] }[] = [
  {
    id: 'document',
    label: '서류',
    fields: [
      { key: 'documentAt', label: '서류 마감일', type: 'date' },
      { key: 'documentAnnouncementAt', label: '서류 발표일', type: 'date' },
      { key: 'documentResult', label: '서류 결과', type: 'select', options: resultOptions },
    ],
  },
  {
    id: 'written',
    label: '필기',
    fields: [
      { key: 'writtenAt', label: '필기 시험일', type: 'date' },
      { key: 'writtenAnnouncementAt', label: '필기 발표일', type: 'date' },
      { key: 'writtenResult', label: '필기 결과', type: 'select', options: resultOptions },
    ],
  },
  {
    id: 'interview',
    label: '면접',
    fields: [
      { key: 'interviewAt', label: '면접일', type: 'date' },
      { key: 'interviewAnnouncementAt', label: '면접 발표일', type: 'date' },
      { key: 'interviewResult', label: '면접 결과', type: 'select', options: resultOptions },
    ],
  },
]

export const certificateValidityOptions = [...Array.from({ length: 10 }, (_, index) => `${index + 1}년`), '영구']

export const fieldsByTab: Record<ResourceTab, Field[]> = {
  certificate: [
    { key: 'credential', label: '자격증명', placeholder: '예: 정보처리기사', required: true },
    { key: 'level', label: '급수', placeholder: '예: 기사' },
    { key: 'issuer', label: '발급기관', placeholder: '예: 한국산업인력공단' },
    { key: 'acquiredAt', label: '취득일', type: 'date' },
    { key: 'validity', label: '유효기간', type: 'select', options: certificateValidityOptions },
    { key: 'expiresAt', label: '만료일', computed: true, placeholder: '취득일을 입력하면 계산됩니다' },
    { key: 'registrationNumber', label: '등록번호', placeholder: '등록번호' },
  ],
  education: [
    { key: 'subject', label: '과목명', placeholder: '과목명', required: true },
    { key: 'credits', label: '학점', placeholder: '예: 3학점' },
    { key: 'grade', label: '성적', placeholder: '예: A+' },
    { key: 'period', label: '이수기간', type: 'daterange' },
    { key: 'content', label: '내용', type: 'textarea', placeholder: '배운 내용과 경험을 기록해 주세요.' },
  ],
  training: [
    { key: 'institution', label: '교육기관명', placeholder: '교육기관명', required: true },
    { key: 'subject', label: '과목명', placeholder: '과목명' },
    { key: 'ncs', label: 'NCS분류', placeholder: 'NCS 분류 코드 또는 명칭' },
    { key: 'hours', label: '교육시간', placeholder: '예: 120시간' },
    { key: 'period', label: '이수기간', type: 'daterange' },
    { key: 'content', label: '내용', type: 'textarea', placeholder: '교육 내용과 활용 경험을 기록해 주세요.' },
  ],
  career: [
    { key: 'institution', label: '기관명', placeholder: '기관명', required: true },
    { key: 'employmentType', label: '고용형태', type: 'select', options: ['인턴', '계약직', '정규직'] },
    { key: 'period', label: '근무기간', type: 'daterange' },
    { key: 'responsibilities', label: '담당업무', type: 'textarea', placeholder: '담당 업무와 성과를 기록해 주세요.' },
  ],
  applications: [...applicationCommonFields, ...applicationStages.flatMap((stage) => stage.fields)],
  essays: [],
  memo: [{ key: 'content', label: '내용', type: 'textarea', placeholder: '기억하고 싶은 내용을 기록해 주세요.' }],
  sites: [
    { key: 'url', label: '사이트 주소', placeholder: 'https://', type: 'url' },
    { key: 'description', label: '설명', type: 'textarea', placeholder: '사이트 설명' },
  ],
}

export const titleFieldByTab: Partial<Record<ResourceTab, string>> = {
  certificate: 'credential',
  education: 'subject',
  training: 'institution',
  career: 'institution',
  applications: 'institution',
}

export function resolveResourceTitle(tab: ResourceTab, title: string, values: Record<string, string>) {
  const key = titleFieldByTab[tab]
  return (key ? values[key] ?? title : title).trim()
}

export function applicationStageById(id: ApplicationStageId) {
  return applicationStages.find((stage) => stage.id === id) ?? applicationStages[0]
}

export function stageHasContent(details: Record<string, string> = {}, stage = applicationStages[0]) {
  return stage.fields.some((field) => {
    const value = details[field.key]?.trim() ?? ''
    if (!value) return false
    if (field.type === 'select' && value === field.options?.[0]) return false
    return true
  })
}

export function detectIncomingStage(details: Record<string, string> = {}): ApplicationStageId {
  return applicationStages.find((stage) => stage.fields.some((field) => details[field.key]?.trim()))?.id ?? 'document'
}

export function defaultApplicationStage(details: Record<string, string> = {}): ApplicationStageId {
  return applicationStages.find((stage) => stageHasContent(details, stage))?.id ?? 'document'
}

export function pickApplicationValues(values: Record<string, string>, stageId: ApplicationStageId) {
  const stage = applicationStageById(stageId)
  const next: Record<string, string> = {}
  for (const field of [...applicationCommonFields, ...stage.fields]) {
    const value = values[field.key]?.trim() ?? ''
    if (value) next[field.key] = value
  }
  if (!stageHasContent(next, stage)) {
    for (const field of stage.fields) delete next[field.key]
  } else {
    for (const field of stage.fields) {
      if (field.type === 'select' && !next[field.key]) next[field.key] = field.options?.[0] ?? ''
    }
  }
  return next
}

export function mergeApplicationDetails(existing: Record<string, string> = {}, incoming: Record<string, string>, stageId: ApplicationStageId) {
  const stageKeys = new Set(applicationStageById(stageId).fields.map((field) => field.key))
  const next = { ...existing }
  for (const field of applicationCommonFields) {
    const value = incoming[field.key]?.trim() ?? ''
    if (value) next[field.key] = value
  }
  for (const key of stageKeys) {
    const value = incoming[key]?.trim() ?? ''
    if (value) next[key] = value
    else delete next[key]
  }
  return next
}

export function toApplicationPayload(values: Record<string, string>, stageId: ApplicationStageId, existingDetails: Record<string, string> = {}): Omit<Resource, 'id'> {
  const details = mergeApplicationDetails(existingDetails, pickApplicationValues(values, stageId), stageId)
  const stages = applicationStages.filter((stage) => stageHasContent(details, stage)).map((stage) => stage.label)
  return {
    ...toResourcePayload('applications', '', details),
    subtitle: stages.join(', '),
    tags: stages,
  }
}

export function overlayApplication(existing: Resource, incoming: Omit<Resource, 'id'>) {
  const stageId = detectIncomingStage(incoming.details ?? {})
  return toApplicationPayload(incoming.details ?? {}, stageId, existing.details ?? {})
}

export function toDateInputValue(value?: string) {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const compact = value.replaceAll('.', '').replaceAll('-', '').replaceAll('/', '').replaceAll(' ', '')
  if (/^\d{8}$/.test(compact)) {
    return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`
  }
  if (/^\d{6}$/.test(compact)) {
    return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-01`
  }
  return value
}

export function parsePeriodRange(period?: string) {
  if (!period?.trim()) return { start: '', end: '' }
  const [rawStart, rawEnd] = period.split(/\s*~\s*/)
  const start = toDateInputValue(rawStart)
  const end = toDateInputValue(rawEnd || rawStart)
  const iso = (value: string) => (/^\d{4}-\d{2}-\d{2}$/.test(value) ? value : '')
  return { start: iso(start), end: iso(end) }
}

export function periodDisplay(details: Record<string, string> = {}) {
  if (details.periodStart) {
    return formatSchedulePeriod({ date: details.periodStart, endDate: details.periodEnd || details.periodStart })
  }
  return details.period?.trim() ?? ''
}

export function initialFieldValues(tab: ResourceTab, details: Record<string, string> = {}, title = '') {
  const values: Record<string, string> = { ...details }
  const titleKey = titleFieldByTab[tab]
  if (titleKey && !values[titleKey]?.trim() && title.trim()) {
    values[titleKey] = title.trim()
  }
  for (const field of fieldsByTab[tab]) {
    if (field.type === 'select' && !values[field.key] && !(tab === 'applications' && field.key !== 'category')) {
      values[field.key] = field.key === 'validity' ? '영구' : (field.options?.[0] ?? '')
    }
    if (field.type === 'date' && values[field.key]) {
      values[field.key] = toDateInputValue(values[field.key])
    }
    if (field.type === 'daterange') {
      const parsed = parsePeriodRange(values.period)
      if (!values.periodStart && parsed.start) values.periodStart = parsed.start
      if (!values.periodEnd && parsed.end) values.periodEnd = parsed.end
    }
  }
  return values
}

export function toResourcePayload(tab: ResourceTab, title: string, values: Record<string, string>): Omit<Resource, 'id'> {
  const resolvedTitle = resolveResourceTitle(tab, title, values)
  const subtitle = [values.item, values.institution, values.subject, values.category, values.issuer, values.level]
    .map((value) => value?.trim() ?? '')
    .find((value) => value && value !== resolvedTitle) ?? ''
  const details = { ...values }
  if (tab === 'certificate') {
    const expires = expiresAtFrom(values.acquiredAt, values.validity)
    if (expires) details.expiresAt = expires
    else delete details.expiresAt
  }
  if (values.periodStart) {
    details.period = formatSchedulePeriod({ date: values.periodStart, endDate: values.periodEnd || values.periodStart })
  }
  if (tab === 'career') delete details.reasonForLeaving
  return {
    tab,
    title: resolvedTitle,
    subtitle,
    body: values.essay || values.content || values.responsibilities || values.description || '',
    details,
    tags: [],
    date: values.acquiredAt || values.periodStart || values.period || values.documentAt || values.writtenAt || values.interviewAt || details.expiresAt || '',
  }
}

export function filledDetails(item: Resource) {
  const details = item.details ?? {}
  return (fieldsByTab[item.tab] ?? [])
    .filter((field) => field.key !== titleFieldByTab[item.tab])
    .map((field) => {
      if (field.type === 'daterange') return { label: field.label, value: periodDisplay(details) }
      return { label: field.label, value: details[field.key]?.trim() ?? '' }
    })
    .filter((row) => row.value && row.label !== '자기소개서' && row.label !== '자기소개서 항목')
}

export type EssayEntry = { item: string; essay: string }

export function emptyEssayEntry(): EssayEntry {
  return { item: '', essay: '' }
}

export function parseEssayEntries(resource: Pick<Resource, 'subtitle' | 'body' | 'details'>): EssayEntry[] {
  const details = resource.details ?? {}
  if (details.entries) {
    try {
      const parsed = JSON.parse(details.entries) as unknown
      if (Array.isArray(parsed)) {
        return parsed
          .map((entry) => ({
            item: typeof entry?.item === 'string' ? entry.item : '',
            essay: typeof entry?.essay === 'string' ? entry.essay : '',
          }))
          .filter((entry) => entry.item.trim() || entry.essay.trim())
      }
    } catch {
      // fall through to the legacy single-item format
    }
  }
  if (details.item || details.essay || resource.subtitle || resource.body) {
    const item = details.item || resource.subtitle || ''
    const essay = details.essay || resource.body || ''
    if (item.trim() || essay.trim()) return [{ item, essay }]
  }
  return []
}

export function toEssayPayload(title: string, entries: EssayEntry[]): Omit<Resource, 'id'> {
  const filled = entries
    .map((entry) => ({ item: entry.item.trim(), essay: entry.essay.trim() }))
    .filter((entry) => entry.item || entry.essay)
  return {
    tab: 'essays',
    title: title.trim(),
    subtitle: filled.map((entry) => entry.item).filter(Boolean).join(', '),
    body: filled.map((entry) => (entry.item ? `${entry.item}\n${entry.essay}` : entry.essay)).join('\n\n'),
    details: { entries: JSON.stringify(filled) },
    tags: filled.map((entry) => entry.item).filter(Boolean),
  }
}

export function mergeEssayResources(items: Resource[]): Resource {
  const [first] = items
  const entries = items.flatMap(parseEssayEntries)
  return {
    ...first,
    ...toEssayPayload(first.title, entries.length ? entries : [emptyEssayEntry()]),
    id: first.id,
    pinned: items.some((item) => item.pinned),
  }
}

export function groupEssaysByPosting(items: Resource[]) {
  const groups = new Map<string, Resource[]>()
  for (const item of items) {
    const key = item.title.trim() || '제목 없음'
    const current = groups.get(key) ?? []
    current.push(item)
    groups.set(key, current)
  }
  return [...groups.entries()]
}
