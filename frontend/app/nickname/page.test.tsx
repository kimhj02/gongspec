/** @vitest-environment jsdom */

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import NicknamePage from '@/app/nickname/page'
import { api } from '@/lib/api'

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      kakaoId: 'k',
      nickname: '',
      email: null,
      createdAt: '2026-01-01T00:00:00Z',
      needsNickname: true,
      admin: false,
    },
    isLoading: false,
    pending: false,
    login: vi.fn(),
    mutate: vi.fn(),
  }),
}))

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('nickname page', () => {
  it('saves a site nickname and goes home', async () => {
    const user = userEvent.setup()
    vi.spyOn(api.users, 'setNickname').mockResolvedValue({
      id: '1',
      kakaoId: 'k',
      nickname: '공스펙',
      email: null,
      createdAt: '2026-01-01T00:00:00Z',
      needsNickname: false,
      admin: false,
    })
    const replace = vi.fn()
    vi.stubGlobal('location', { replace })

    render(<NicknamePage />)

    expect(screen.getByText('닉네임을 정해 주세요')).toBeTruthy()
    await user.type(screen.getByPlaceholderText('한글·영문·숫자 2~16자'), '공스펙')
    await user.click(screen.getByRole('button', { name: '시작하기' }))
    await vi.waitFor(() => expect(api.users.setNickname).toHaveBeenCalledWith('공스펙'))
    expect(replace).toHaveBeenCalledWith('/')
  })
})
