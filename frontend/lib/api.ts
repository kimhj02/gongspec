export type ResourceTab = 'certificate' | 'education' | 'training' | 'career' | 'applications' | 'essays' | 'memo' | 'sites'
export type NavId = 'calendar' | 'recruits' | ResourceTab
export type HireTypeFilter = '정규직' | '계약직' | '인턴'
export type ScheduleType = '개인' | '서류' | '필기' | '면접' | '지원'
export type Resource = {
  id: string
  tab: ResourceTab
  title: string
  subtitle?: string
  body?: string
  tags?: string[]
  date?: string
  pinned?: boolean
  collapsed?: boolean
  details?: Record<string, string>
}
export type Schedule = { id: string; title: string; date: string; endDate?: string; memo?: string; type: ScheduleType }
export type AuthUser = {
  id: string
  kakaoId: string
  nickname: string
  email: string | null
  createdAt: string
}
export type PublicRecruit = {
  id: string
  recrutPblntSn: number
  instNm: string
  title: string
  hireType: HireTypeFilter | string
  hireTypes: string
  recrutSeNm: string
  workRgnNmLst: string
  pbancBgngYmd: string
  pbancEndYmd: string
  ongoing: boolean
  srcUrl: string
  recrutNope: number | null
  ncsCdNmLst: string
}
export type RecruitSyncResult = { fetched: number; saved: number; closed: number }

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '')
const REQUEST_TIMEOUT_MS = 15_000
const SYNC_TIMEOUT_MS = 120_000

type RequestOptions = RequestInit & { timeoutMs?: number }

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function isUnauthorized(error: unknown) {
  return error instanceof ApiError && error.status === 401
}

export function apiUrl(path: string) {
  return `${API_BASE_URL ?? ''}${path}`
}

function mergeSignals(signals: AbortSignal[]) {
  if (typeof AbortSignal.any === 'function') return AbortSignal.any(signals)
  return signals[0]
}

export async function request<T>(path: string, init: RequestOptions = {}): Promise<T> {
  const { timeoutMs, signal: userSignal, headers: initHeaders, ...fetchInit } = init
  const headers = new Headers(initHeaders)
  if (fetchInit.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const timeout = new AbortController()
  const timer = setTimeout(() => timeout.abort(), timeoutMs ?? REQUEST_TIMEOUT_MS)
  const signal = userSignal ? mergeSignals([userSignal, timeout.signal]) : timeout.signal

  try {
    const response = await fetch(apiUrl(path), { credentials: 'include', ...fetchInit, headers, signal })
    if (!response.ok) {
      const contentType = response.headers.get('content-type') ?? ''
      const message = contentType.includes('application/json')
        ? await response.json().then((body) => body.message || body.error).catch(() => '')
        : ''
      throw new ApiError(response.status, message || `Spring Boot 서버 요청에 실패했습니다. (${response.status})`)
    }
    if (response.status === 204) return undefined as T
    return response.json() as Promise<T>
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.')
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}

export const api = {
  auth: {
    kakaoUrl: () => request<{ url: string }>('/api/auth/kakao/url'),
    callback: (body: { code: string; state: string }) =>
      request<AuthUser>('/api/auth/kakao/callback', { method: 'POST', body: JSON.stringify(body) }),
    me: () => request<AuthUser>('/api/auth/me'),
    logout: () => request<void>('/api/auth/logout', { method: 'POST' }),
  },
  resources: {
    list: (params?: { tab?: ResourceTab; query?: string }, init?: RequestInit) => {
      const search = new URLSearchParams()
      if (params?.tab) search.set('tab', params.tab)
      if (params?.query) search.set('query', params.query)
      return request<Resource[]>(`/api/resources${search.size ? `?${search}` : ''}`, init)
    },
    create: (resource: Omit<Resource, 'id'>) => request<Resource>('/api/resources', { method: 'POST', body: JSON.stringify(resource) }),
    update: (id: string, resource: Partial<Resource>) => request<Resource>(`/api/resources/${id}`, { method: 'PUT', body: JSON.stringify(resource) }),
    reorder: (ids: string[]) => request<void>('/api/resources/order', { method: 'PUT', body: JSON.stringify({ ids }) }),
    remove: (id: string) => request<void>(`/api/resources/${id}`, { method: 'DELETE' }),
  },
  schedules: {
    list: (init?: RequestInit) => request<Schedule[]>('/api/schedules', init),
    create: (schedule: Omit<Schedule, 'id'>) => request<Schedule>('/api/schedules', { method: 'POST', body: JSON.stringify(schedule) }),
    update: (id: string, schedule: Omit<Schedule, 'id'>) => request<Schedule>(`/api/schedules/${id}`, { method: 'PUT', body: JSON.stringify(schedule) }),
    remove: (id: string) => request<void>(`/api/schedules/${id}`, { method: 'DELETE' }),
  },
  recruits: {
    list: (params?: { query?: string; hireType?: HireTypeFilter | '' }, init?: RequestInit) => {
      const search = new URLSearchParams()
      if (params?.query) search.set('query', params.query)
      if (params?.hireType) search.set('hireType', params.hireType)
      return request<PublicRecruit[]>(`/api/recruits${search.size ? `?${search}` : ''}`, init)
    },
    sync: () => request<RecruitSyncResult>('/api/recruits/sync', { method: 'POST', timeoutMs: SYNC_TIMEOUT_MS }),
  },
}

export function getApiError(error: unknown) {
  return error instanceof Error ? error.message : '서버와 통신할 수 없습니다.'
}

export const meKey = ['/api/auth/me'] as const
export const resourceKey = (tab: ResourceTab, query: string) => ['/api/resources', tab, query] as const
export const applicationsKey = ['/api/resources', 'applications', 'calendar'] as const
export const schedulesKey = ['/api/schedules'] as const
export const recruitsKey = (query: string, hireType: HireTypeFilter | '') => ['/api/recruits', query, hireType] as const
