import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, api, apiUrl, getApiError, isUnauthorized, request } from './api'

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    headers: new Headers({ 'content-type': 'application/json' }),
  }
}

describe('api client', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('uses a relative url when no public api base is set', () => {
    expect(apiUrl('/api/resources')).toBe('/api/resources')
  })

  it('does not send json content-type on GET', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([]))
    vi.stubGlobal('fetch', fetchMock)

    await api.resources.list({ query: '기사' })

    const headers = fetchMock.mock.calls[0][1].headers as Headers
    expect(headers.has('Content-Type')).toBe(false)
    expect(fetchMock.mock.calls[0][0]).toBe('/api/resources?query=%EA%B8%B0%EC%82%AC')
    expect(fetchMock.mock.calls[0][1].credentials).toBe('include')
  })

  it('sends json content-type on POST', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ id: '1', title: '메모', tab: 'memo' }))
    vi.stubGlobal('fetch', fetchMock)

    await api.resources.create({ tab: 'memo', title: '메모', details: { content: '내용' } })

    const headers = fetchMock.mock.calls[0][1].headers as Headers
    expect(headers.get('Content-Type')).toBe('application/json')
  })

  it('does not send json content-type on DELETE', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ...jsonResponse(undefined, 204), json: async () => undefined })
    vi.stubGlobal('fetch', fetchMock)

    await api.resources.remove('abc')

    const headers = fetchMock.mock.calls[0][1].headers as Headers
    expect(headers.has('Content-Type')).toBe(false)
  })

  it('maps abort errors to a timeout message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() => {
        const error = new Error('aborted')
        error.name = 'AbortError'
        return Promise.reject(error)
      }),
    )

    await expect(request('/api/resources')).rejects.toThrow('서버 응답이 지연되고 있습니다')
  })

  it('reads api error messages', () => {
    expect(getApiError(new Error('연결 실패'))).toBe('연결 실패')
    expect(getApiError('nope')).toBe('서버와 통신할 수 없습니다.')
  })

  it('throws unauthorized api errors', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ message: '로그인이 필요합니다.' }, 401))
    vi.stubGlobal('fetch', fetchMock)

    await expect(api.auth.me()).rejects.toMatchObject({ status: 401, message: '로그인이 필요합니다.' })
    await expect(api.auth.me()).rejects.toBeInstanceOf(ApiError)
    expect(isUnauthorized(new ApiError(401, '로그인이 필요합니다.'))).toBe(true)
    expect(isUnauthorized(new Error('로그인이 필요합니다.'))).toBe(false)
  })

  it('posts kakao callback payload', async () => {
    const user = { id: '1', kakaoId: 'k', nickname: '현진', email: null, createdAt: '2026-01-01T00:00:00Z' }
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(user))
    vi.stubGlobal('fetch', fetchMock)

    await expect(api.auth.callback({ code: 'code', state: 'state' })).resolves.toEqual(user)
    expect(fetchMock.mock.calls[0][0]).toBe('/api/auth/kakao/callback')
    expect(fetchMock.mock.calls[0][1].body).toBe(JSON.stringify({ code: 'code', state: 'state' }))
  })

  it('lists recruits with hire type and posts sync without json content-type', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse({ fetched: 1, saved: 1, closed: 0 }))
    vi.stubGlobal('fetch', fetchMock)

    await api.recruits.list({ query: '한국전력', hireType: '정규직' })
    expect(fetchMock.mock.calls[0][0]).toBe('/api/recruits?query=%ED%95%9C%EA%B5%AD%EC%A0%84%EB%A0%A5&hireType=%EC%A0%95%EA%B7%9C%EC%A7%81')

    await api.recruits.sync()
    expect(fetchMock.mock.calls[1][0]).toBe('/api/recruits/sync')
    expect(fetchMock.mock.calls[1][1].method).toBe('POST')
    const headers = fetchMock.mock.calls[1][1].headers as Headers
    expect(headers.has('Content-Type')).toBe(false)
  })

  it('puts resource order ids', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ...jsonResponse(undefined, 204), json: async () => undefined })
    vi.stubGlobal('fetch', fetchMock)

    await api.resources.reorder(['a', 'b'])
    expect(fetchMock.mock.calls[0][0]).toBe('/api/resources/order')
    expect(fetchMock.mock.calls[0][1].method).toBe('PUT')
    expect(fetchMock.mock.calls[0][1].body).toBe(JSON.stringify({ ids: ['a', 'b'] }))
  })
})
