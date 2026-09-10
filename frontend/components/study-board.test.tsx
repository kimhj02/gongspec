/** @vitest-environment jsdom */

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import StudyBoard from '@/components/study-board'
import { api, type StudyPost } from '@/lib/api'

vi.mock('swr', async () => {
  const actual = await vi.importActual<typeof import('swr')>('swr')
  return actual
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const post: StudyPost = {
  id: 'post-1',
  title: '한전 필기 스터디',
  institution: '한국전력공사',
  recruitId: null,
  recruitTitle: null,
  purpose: 'NCS',
  mode: '온라인',
  region: '서울',
  capacity: 4,
  scheduleText: '주 2회',
  body: '같이 기출 풀어요',
  status: '모집 중',
  authorId: '1',
  authorNickname: '공스펙',
  mine: true,
  commentCount: 0,
  createdAt: '2026-09-09T00:00:00Z',
}

describe('study board', () => {
  it('lists posts and opens the write form', async () => {
    const user = userEvent.setup()
    vi.spyOn(api.study, 'list').mockResolvedValue([post])
    render(<StudyBoard onNotice={vi.fn()} />)

    expect(await screen.findByText('한전 필기 스터디')).toBeTruthy()
    expect(screen.getByText(/한국전력공사/)).toBeTruthy()
    expect(screen.getByText('공스펙 · 댓글 0')).toBeTruthy()

    await user.click(screen.getAllByRole('button', { name: '모집글 쓰기' })[0])
    expect(screen.getByRole('heading', { name: '모집글 쓰기' })).toBeTruthy()
    expect(screen.getByLabelText('기관명 (선택)').tagName).toBe('INPUT')
  })
})
