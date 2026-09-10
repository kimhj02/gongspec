/** @vitest-environment jsdom */

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AdminPage from '@/app/admin/page'
import { api, type CommunityReport } from '@/lib/api'

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: {
      id: 'admin-1',
      kakaoId: 'admin-kakao',
      nickname: '관리닉',
      email: null,
      createdAt: '2026-01-01T00:00:00Z',
      needsNickname: false,
      admin: true,
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
})

const report: CommunityReport = {
  id: 'r1',
  targetType: 'POST',
  targetId: 'post-1',
  reason: '광고 같아요',
  reporterNickname: '신고닉',
  postTitle: '숨길 글',
  commentBody: null,
  hidden: false,
  createdAt: '2026-09-09T00:00:00Z',
}

describe('admin page', () => {
  it('lists reports and hides a post', async () => {
    const user = userEvent.setup()
    vi.spyOn(api.admin, 'reports').mockResolvedValue([report])
    vi.spyOn(api.admin, 'hidePost').mockResolvedValue(undefined)

    render(<AdminPage />)

    expect(await screen.findByText('숨길 글')).toBeTruthy()
    expect(screen.getByText('광고 같아요')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: '숨기기' }))
    expect(api.admin.hidePost).toHaveBeenCalledWith('post-1')
  })
})
