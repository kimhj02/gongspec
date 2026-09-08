/** @vitest-environment jsdom */

import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SWRConfig } from 'swr'
import { ApiError, api } from '@/lib/api'
import { useAuth } from './use-auth'

const user = {
  id: '1',
  kakaoId: 'kakao-1',
  nickname: '현진',
  email: null,
  createdAt: '2026-01-01T00:00:00Z',
}

function wrapper({ children }: { children: ReactNode }) {
  return (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      {children}
    </SWRConfig>
  )
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('useAuth', () => {
  it('treats 401 as logged out', async () => {
    vi.spyOn(api.auth, 'me').mockRejectedValue(new ApiError(401, '로그인이 필요합니다.'))

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.user).toBeNull()
    expect(result.current.isLoggedIn).toBe(false)
    expect(result.current.error).toBeUndefined()
  })

  it('returns the current user', async () => {
    vi.spyOn(api.auth, 'me').mockResolvedValue(user)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.user).toEqual(user))
    expect(result.current.isLoggedIn).toBe(true)
  })

  it('redirects to the kakao url', async () => {
    vi.spyOn(api.auth, 'me').mockRejectedValue(new ApiError(401, '로그인이 필요합니다.'))
    vi.spyOn(api.auth, 'kakaoUrl').mockResolvedValue({ url: 'https://kauth.kakao.com/oauth/authorize' })
    const assign = vi.fn()
    vi.stubGlobal('location', { assign })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.login()
    })

    expect(assign).toHaveBeenCalledWith('https://kauth.kakao.com/oauth/authorize')
  })

  it('clears the user on logout', async () => {
    vi.spyOn(api.auth, 'me').mockResolvedValue(user)
    vi.spyOn(api.auth, 'logout').mockResolvedValue(undefined)

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.user).toEqual(user))

    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.user).toBeNull()
  })
})
