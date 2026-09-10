/** @vitest-environment jsdom */

import { StrictMode } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import LoginGate from '@/components/login-gate'
import KakaoCallbackPage from '@/app/auth/kakao/callback/page'
import { api } from '@/lib/api'

afterEach(() => {
  cleanup()
  sessionStorage.clear()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('login gate', () => {
  it('starts kakao login from the gate button', async () => {
    const user = userEvent.setup()
    const onLogin = vi.fn()
    render(<LoginGate onLogin={onLogin} />)

    await user.click(screen.getByRole('button', { name: '카카오로 시작하기' }))
    expect(onLogin).toHaveBeenCalledTimes(1)
  })
})

describe('kakao callback page', () => {
  it('exchanges the code and returns home', async () => {
    vi.spyOn(api.auth, 'callback').mockResolvedValue({
      id: '1',
      kakaoId: 'k',
      nickname: '',
      email: null,
      createdAt: '2026-01-01T00:00:00Z',
      needsNickname: true,
      admin: false,
    })
    const replace = vi.fn()
    vi.stubGlobal('location', { search: '?code=auth-code&state=csrf-state', replace })

    render(<KakaoCallbackPage />)

    await vi.waitFor(() => expect(api.auth.callback).toHaveBeenCalledWith({ code: 'auth-code', state: 'csrf-state' }))
    expect(replace).toHaveBeenCalledWith('/nickname')
  })

  it('exchanges the code only once in strict mode', async () => {
    vi.spyOn(api.auth, 'callback').mockResolvedValue({
      id: '1',
      kakaoId: 'k',
      nickname: '공스펙',
      email: null,
      createdAt: '2026-01-01T00:00:00Z',
      needsNickname: false,
      admin: false,
    })
    const replace = vi.fn()
    vi.stubGlobal('location', { search: '?code=auth-code&state=csrf-state', replace })

    render(
      <StrictMode>
        <KakaoCallbackPage />
      </StrictMode>,
    )

    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith('/'))
    expect(api.auth.callback).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('로그인에 실패했습니다')).toBeNull()
  })

  it('shows an error when kakao cancels', async () => {
    vi.stubGlobal('location', { search: '?error=access_denied', replace: vi.fn() })

    render(<KakaoCallbackPage />)

    expect(await screen.findByText('로그인에 실패했습니다')).toBeTruthy()
    expect(screen.getByRole('link', { name: '홈으로 돌아가기' })).toBeTruthy()
  })
})
