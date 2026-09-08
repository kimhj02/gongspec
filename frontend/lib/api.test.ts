import { afterEach, describe, expect, it, vi } from 'vitest'
import { api, apiUrl, getApiError, request } from './api'

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
})
