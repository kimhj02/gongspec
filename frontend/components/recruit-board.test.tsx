/** @vitest-environment jsdom */

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import RecruitBoard from '@/components/recruit-board'
import type { PublicRecruit } from '@/lib/api'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

const recruit: PublicRecruit = {
  id: '1',
  recrutPblntSn: 11,
  instNm: '한국전력공사',
  title: '사무직 채용',
  hireType: '정규직',
  hireTypes: '정규직,계약직',
  recrutSeNm: '신입',
  workRgnNmLst: '서울',
  pbancBgngYmd: '2026-09-01',
  pbancEndYmd: '2026-09-16',
  ongoing: true,
  srcUrl: 'https://example.com/notice',
  recrutNope: 3,
  ncsCdNmLst: '사무',
}

describe('recruit board', () => {
  it('shows a deadline-ordered table with source urls', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 8, 9))
    render(
      <RecruitBoard
        onRegister={() => undefined}
        items={[
          { ...recruit, id: 'later', title: '나중 공고', pbancEndYmd: '2026-09-20' },
          recruit,
        ]}
      />,
    )

    expect(screen.getByRole('columnheader', { name: '공고명' })).toBeTruthy()
    expect(screen.getByRole('columnheader', { name: '접수기간' })).toBeTruthy()
    expect(screen.getByRole('columnheader', { name: '채용구분' })).toBeTruthy()
    expect(screen.getByRole('columnheader', { name: '채용인원' })).toBeTruthy()
    expect(screen.getByRole('columnheader', { name: 'D-DAY' })).toBeTruthy()
    expect(screen.getByRole('columnheader', { name: '채용공고 원본 주소' })).toBeTruthy()
    expect(screen.getAllByRole('button', { name: '지원 현황 등록' })).toHaveLength(2)
    expect(screen.getByText('사무직 채용')).toBeTruthy()
    expect(screen.getByText('2026.09.01 ~ 2026.09.16')).toBeTruthy()
    expect(screen.getByText('D-7')).toBeTruthy()
    expect(screen.getAllByText('한국전력공사')).toHaveLength(2)
    expect(screen.getAllByText('신입')).toHaveLength(2)
    expect(screen.getAllByText('3명')).toHaveLength(2)
    expect(screen.getAllByRole('link', { name: 'https://example.com/notice' })[0].getAttribute('href')).toBe(
      'https://example.com/notice',
    )
    const titles = screen.getAllByRole('row').slice(1).map((row) => row.querySelector('strong')?.textContent)
    expect(titles).toEqual(['사무직 채용', '나중 공고'])
  })

  it('registers a recruit into the application form', async () => {
    const user = userEvent.setup()
    const onRegister = vi.fn()
    render(<RecruitBoard items={[recruit]} onRegister={onRegister} />)

    await user.click(screen.getByRole('button', { name: '지원 현황 등록' }))
    expect(onRegister).toHaveBeenCalledWith(recruit)
  })
})
