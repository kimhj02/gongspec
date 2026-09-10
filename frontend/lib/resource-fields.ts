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
  countChars?: boolean
}

export type ApplicationStageId = 'document' | 'written' | 'interview'
export type InterviewRoundId = '1' | '2' | '3'

export function characterCountLabel(text = '') {
  return `(공백 포함 ${text.length}자 · 공백 제외 ${text.replace(/\s/g, '').length}자)`
}

const resultOptions = ['대기중', '합격', '불합격']

export const applicationCommonFields: Field[] = [
  { key: 'category', label: '구분', type: 'select', options: ['정규직', '계약직', '인턴', '기타'] },
  { key: 'institution', label: '회사명', placeholder: '예: 서울교통공사', required: true },
  { key: 'posting', label: '공고명', placeholder: '예: 2026년 9급 행정직', required: true },
  { key: 'homepage', label: '지원 홈페이지', placeholder: '채용 사이트 주소 (선택)' },
]

export const interviewRounds: { id: InterviewRoundId; label: string; fields: Field[] }[] = [
  {
    id: '1',
    label: '1차',
    fields: [
      { key: 'interviewAt', label: '1차 면접일', type: 'date' },
      { key: 'interviewAnnouncementAt', label: '1차 면접 발표일', type: 'date' },
      { key: 'interviewResult', label: '1차 면접 결과', type: 'select', options: resultOptions },
    ],
  },
  {
    id: '2',
    label: '2차',
    fields: [
      { key: 'interview2At', label: '2차 면접일', type: 'date' },
      { key: 'interview2AnnouncementAt', label: '2차 면접 발표일', type: 'date' },
      { key: 'interview2Result', label: '2차 면접 결과', type: 'select', options: resultOptions },
    ],
  },
  {
    id: '3',
    label: '3차',
    fields: [
      { key: 'interview3At', label: '3차 면접일', type: 'date' },
      { key: 'interview3AnnouncementAt', label: '3차 면접 발표일', type: 'date' },
      { key: 'interview3Result', label: '3차 면접 결과', type: 'select', options: resultOptions },
    ],
  },
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
    fields: interviewRounds.flatMap((round) => round.fields),
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
    { key: 'content', label: '내용', type: 'textarea', placeholder: '배운 내용과 경험을 기록해 주세요.', countChars: true },
  ],
  training: [
    { key: 'subject', label: '과목명', placeholder: '과목명', required: true },
    { key: 'institution', label: '교육기관명', placeholder: '교육기관명', required: true },
    { key: 'ncs', label: 'NCS분류', placeholder: 'NCS 분류 코드 또는 명칭' },
    { key: 'hours', label: '교육시간', placeholder: '예: 120시간' },
    { key: 'period', label: '이수기간', type: 'daterange' },
    { key: 'content', label: '내용', type: 'textarea', placeholder: '교육 내용과 활용 경험을 기록해 주세요.', countChars: true },
  ],
  career: [
    { key: 'institution', label: '기관명', placeholder: '기관명', required: true },
    { key: 'employmentType', label: '고용형태', type: 'select', options: ['인턴', '계약직', '정규직'] },
    { key: 'period', label: '근무기간', type: 'daterange' },
    { key: 'responsibilities', label: '담당업무', type: 'textarea', placeholder: '담당 업무와 성과를 기록해 주세요.', countChars: true },
  ],
  project: [
    { key: 'name', label: '프로젝트명', placeholder: '예: MediCheck', required: true },
    { key: 'oneLiner', label: '한 줄 소개', type: 'textarea', rows: 2, placeholder: '무엇을 한 프로젝트인지 한 줄로 적어 주세요.' },
    { key: 'period', label: '기간', type: 'daterange' },
    { key: 'role', label: '역할', placeholder: '예: 1인 풀스택' },
    { key: 'url', label: '서비스 주소', type: 'url', placeholder: 'https://' },
    { key: 'stack', label: '기술 스택', type: 'textarea', rows: 2, placeholder: '예: Java 21, Spring Boot, React, MySQL, AWS' },
    { key: 'background', label: '만든 이유', type: 'textarea', placeholder: '왜 이 서비스를 만들었는지 적어 주세요.' },
    { key: 'work', label: '맡은 일', type: 'textarea', placeholder: '기획·구현·배포 중 직접 한 일과 핵심 기능을 적어 주세요.' },
    { key: 'problem', label: '문제와 해결', type: 'textarea', placeholder: '막혔던 문제와 어떻게 풀었는지, 그 결과를 적어 주세요.' },
    { key: 'results', label: '성과·수치', type: 'textarea', rows: 3, placeholder: '기간, API 수, 운영 URL처럼 숫자로 말할 수 있는 결과를 적어 주세요.' },
    { key: 'essay', label: '자소서 문장', type: 'textarea', placeholder: '지원서에 그대로 넣을 문단을 적어 두세요.' },
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
  training: 'subject',
  career: 'institution',
  project: 'name',
  applications: 'posting',
}

export function resolveResourceTitle(tab: ResourceTab, title: string, values: Record<string, string>) {
  const key = titleFieldByTab[tab]
  return (key ? values[key]?.trim() || title : title).trim()
}

export function resourceCardTitle(item: Pick<Resource, 'tab' | 'title' | 'details'>) {
  return resolveResourceTitle(item.tab, item.title, item.details ?? {})
}

export function resourceCardSubtitle(item: Pick<Resource, 'tab' | 'title' | 'subtitle' | 'details'>) {
  const title = resourceCardTitle(item)
  if (item.tab === 'training') {
    const institution = item.details?.institution?.trim() || (item.title.trim() !== title ? item.title.trim() : '')
    if (institution && institution !== title) return institution
  }
  if (item.tab === 'project') {
    const oneLiner = item.details?.oneLiner?.trim() || item.subtitle?.trim() || ''
    return oneLiner && oneLiner !== title ? oneLiner : ''
  }
  const subtitle = item.subtitle?.trim() ?? ''
  return subtitle && subtitle !== title ? subtitle : ''
}

export function applicationPostingName(item: Pick<Resource, 'title' | 'details'>) {
  return item.details?.posting?.trim() || item.title.trim()
}

export function applicationCompanyName(item: Pick<Resource, 'subtitle' | 'details'>) {
  return item.details?.institution?.trim() || item.subtitle?.trim() || ''
}

export function applicationStageById(id: ApplicationStageId) {
  return applicationStages.find((stage) => stage.id === id) ?? applicationStages[0]
}

export function interviewRoundById(id: InterviewRoundId = '1') {
  return interviewRounds.find((round) => round.id === id) ?? interviewRounds[0]
}

export function stageFields(stageId: ApplicationStageId, roundId: InterviewRoundId = '1') {
  if (stageId === 'interview') return interviewRoundById(roundId).fields
  return applicationStageById(stageId).fields
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

export function detectIncomingInterviewRound(details: Record<string, string> = {}): InterviewRoundId {
  return interviewRounds.find((round) => round.fields.some((field) => details[field.key]?.trim()))?.id ?? '1'
}

export function defaultApplicationStage(details: Record<string, string> = {}): ApplicationStageId {
  return applicationStages.find((stage) => stageHasContent(details, stage))?.id ?? 'document'
}

export function defaultInterviewRound(details: Record<string, string> = {}): InterviewRoundId {
  return interviewRounds.find((round) => stageHasContent(details, { id: 'interview', label: round.label, fields: round.fields }))?.id ?? '1'
}

export function pickApplicationValues(
  values: Record<string, string>,
  stageId: ApplicationStageId,
  roundId: InterviewRoundId = '1',
) {
  const fields = stageFields(stageId, roundId)
  const next: Record<string, string> = {}
  for (const field of [...applicationCommonFields, ...fields]) {
    const value = values[field.key]?.trim() ?? ''
    if (value) next[field.key] = value
  }
  if (!stageHasContent(next, { id: stageId, label: '', fields })) {
    for (const field of fields) delete next[field.key]
  } else {
    for (const field of fields) {
      if (field.type === 'select' && !next[field.key]) next[field.key] = field.options?.[0] ?? ''
    }
  }
  return next
}

export function mergeApplicationDetails(
  existing: Record<string, string> = {},
  incoming: Record<string, string>,
  stageId: ApplicationStageId,
  roundId: InterviewRoundId = '1',
) {
  const stageKeys = new Set(stageFields(stageId, roundId).map((field) => field.key))
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

export function toApplicationPayload(
  values: Record<string, string>,
  stageId: ApplicationStageId,
  existingDetails: Record<string, string> = {},
  roundId: InterviewRoundId = '1',
): Omit<Resource, 'id'> {
  const details = mergeApplicationDetails(existingDetails, pickApplicationValues(values, stageId, roundId), stageId, roundId)
  const stages = applicationStages.filter((stage) => stageHasContent(details, stage)).map((stage) => stage.label)
  return {
    ...toResourcePayload('applications', '', details),
    subtitle: details.institution?.trim() || '',
    tags: stages,
  }
}

export function overlayApplication(existing: Resource, incoming: Omit<Resource, 'id'>) {
  const existingDetails = existing.details ?? {}
  const incomingDetails = incoming.details ?? {}
  const changed: Record<string, string> = {}
  for (const [key, value] of Object.entries(incomingDetails)) {
    if ((value ?? '') !== (existingDetails[key] ?? '')) changed[key] = value
  }
  const scope = Object.keys(changed).length ? changed : incomingDetails
  return toApplicationPayload(
    incomingDetails,
    detectIncomingStage(scope),
    existingDetails,
    detectIncomingInterviewRound(scope),
  )
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
    const titleLooksLikeInstitution = tab === 'training' && values.institution?.trim() === title.trim()
    if (!titleLooksLikeInstitution) values[titleKey] = title.trim()
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
  const subtitle =
    tab === 'project'
      ? values.oneLiner?.trim() ?? ''
      : [values.item, values.institution, values.subject, values.category, values.issuer, values.level]
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
    body: values.essay || values.content || values.responsibilities || values.description || values.work || '',
    details,
    tags: [],
    date:
      values.acquiredAt ||
      values.periodStart ||
      values.period ||
      values.documentAt ||
      values.writtenAt ||
      values.interviewAt ||
      values.interview2At ||
      values.interview3At ||
      details.expiresAt ||
      '',
  }
}

export function filledDetails(item: Resource) {
  const details = item.details ?? {}
  return (fieldsByTab[item.tab] ?? [])
    .filter((field) => field.key !== titleFieldByTab[item.tab])
    .filter((field) => !((item.tab === 'applications' || item.tab === 'training') && field.key === 'institution'))
    .filter((field) => !(item.tab === 'project' && field.key === 'oneLiner'))
    .map((field) => {
      if (field.type === 'daterange') return { label: field.label, value: periodDisplay(details), countChars: false }
      return { label: field.label, value: details[field.key]?.trim() ?? '', countChars: Boolean(field.countChars) }
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
