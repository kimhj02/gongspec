/** @vitest-environment jsdom */

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ResourceForm from '@/components/resource-form'
import DdayCard from '@/components/dday-card'
import EssayBoard from '@/components/essay-board'
import ResourceCard from '@/components/resource-card'
import ConfirmDialog from '@/components/confirm-dialog'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('resource form', () => {
  it('submits select defaults without changing them', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<ResourceForm initial={null} activeTab="certificate" onClose={() => undefined} onSave={onSave} />)

    expect(screen.queryByPlaceholderText('자료 제목')).toBeNull()
    await user.type(screen.getByPlaceholderText('예: 정보처리기사'), '정보처리기사')
    await user.click(screen.getByRole('button', { name: /추가/ }))
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '정보처리기사',
      }),
    )
  })

  it('calculates expiry from acquired date and selected years', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<ResourceForm initial={null} activeTab="certificate" onClose={() => undefined} onSave={onSave} />)

    await user.type(screen.getByPlaceholderText('예: 정보처리기사'), '정보처리기사')
    await user.type(screen.getByLabelText('취득일'), '2026-09-02')
    await user.selectOptions(screen.getByLabelText('유효기간'), '5년')
    expect(screen.getByDisplayValue('2031-09-02')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /추가/ }))
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        details: expect.objectContaining({ validity: '5년', expiresAt: '2031-09-02' }),
      }),
    )
  })

  it('hides the title field when a tab already has a name', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<ResourceForm initial={null} activeTab="education" onClose={() => undefined} onSave={onSave} />)

    expect(screen.queryByPlaceholderText('자료 제목')).toBeNull()
    await user.type(screen.getByPlaceholderText('과목명'), '헌법')
    await user.click(screen.getByRole('button', { name: /추가/ }))

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ tab: 'education', title: '헌법' }))
  })

  it('lets the user pick an education period on the calendar', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-09-08T00:00:00'))
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<ResourceForm initial={null} activeTab="education" onClose={() => undefined} onSave={onSave} />)

    await user.type(screen.getByPlaceholderText('과목명'), '헌법')
    await user.click(screen.getByRole('button', { name: '이수기간' }))
    await user.click(screen.getByRole('button', { name: '9월 1일 선택' }))
    await user.click(screen.getByRole('button', { name: '9월 10일 선택' }))
    await user.click(screen.getByRole('button', { name: /추가/ }))

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        details: expect.objectContaining({
          periodStart: '2026-09-01',
          periodEnd: '2026-09-10',
          period: '2026.09.01 ~ 2026.09.10',
        }),
      }),
    )
  })
})

describe('application form', () => {
  it('writes one stage at a time', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<ResourceForm initial={null} activeTab="applications" onClose={() => undefined} onSave={onSave} />)

    expect(screen.getByText('서류 마감일')).toBeTruthy()
    expect(screen.queryByText('필기 시험일')).toBeNull()
    expect(screen.queryByText('서류일')).toBeNull()

    await user.type(screen.getByPlaceholderText('예: 서울교통공사'), '서울교통공사')
    await user.type(screen.getByPlaceholderText('예: 2026년 9급 행정직'), '9급 행정직')
    await user.click(screen.getByRole('tab', { name: '필기' }))
    expect(screen.getByText('필기 시험일')).toBeTruthy()
    expect(screen.queryByText('서류 마감일')).toBeNull()

    await user.type(screen.getByLabelText('필기 시험일'), '2026-09-20')
    await user.click(screen.getByRole('button', { name: /추가/ }))

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        tab: 'applications',
        title: '9급 행정직',
        subtitle: '서울교통공사',
        details: expect.objectContaining({ institution: '서울교통공사', posting: '9급 행정직', writtenAt: '2026-09-20' }),
      }),
    )
    expect(onSave.mock.calls[0][0].details.documentAt).toBeUndefined()
  })
})

describe('essay form', () => {
  it('saves a posting with multiple essay items', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<ResourceForm initial={null} activeTab="essays" onClose={() => undefined} onSave={onSave} />)

    await user.type(screen.getByPlaceholderText('예: 2026년 9급 행정직'), '서울시 9급')
    await user.type(screen.getByPlaceholderText('예: 지원동기, 성장과정, 입사 후 포부'), '지원동기')
    await user.type(screen.getByPlaceholderText('해당 항목의 자기소개서를 작성해 주세요.'), '공공의 이익을 위해 지원했습니다.')
    expect(screen.getByText(/공백 포함 18자/)).toBeTruthy()
    expect(screen.getByText(/공백 제외 15자/)).toBeTruthy()
    await user.click(screen.getByRole('button', { name: '항목 추가' }))
    const itemFields = screen.getAllByPlaceholderText('예: 지원동기, 성장과정, 입사 후 포부')
    const essayFields = screen.getAllByPlaceholderText('해당 항목의 자기소개서를 작성해 주세요.')
    await user.type(itemFields[1], '성장과정')
    await user.type(essayFields[1], '동아리 활동을 통해 성장했습니다.')
    await user.click(screen.getByRole('button', { name: /^추가$/ }))

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        tab: 'essays',
        title: '서울시 9급',
        details: expect.objectContaining({
          entries: JSON.stringify([
            { item: '지원동기', essay: '공공의 이익을 위해 지원했습니다.' },
            { item: '성장과정', essay: '동아리 활동을 통해 성장했습니다.' },
          ]),
        }),
      }),
    )
  })
})

describe('resource card', () => {
  it('renders filled details instead of only the title', () => {
    render(
      <ResourceCard
        item={{
          id: '1',
          tab: 'certificate',
          title: '정보처리기사',
          details: { issuer: '한국산업인력공단', acquiredAt: '2024-06-01' },
        }}
        collapsed={false}
        onEdit={() => undefined}
        onDelete={() => undefined}
        onTogglePin={() => undefined}
        onToggleCollapsed={() => undefined}
      />,
    )

    expect(screen.getByText('발급기관')).toBeTruthy()
    expect(screen.getByText('한국산업인력공단')).toBeTruthy()
    expect(screen.getByText('취득일')).toBeTruthy()
  })

  it('lets an application open the essay editor or list', async () => {
    const user = userEvent.setup()
    const onWriteEssay = vi.fn()
    const onOpenEssay = vi.fn()
    render(
      <ResourceCard
        item={{ id: '1', tab: 'applications', title: '서울시' }}
        collapsed={false}
        onEdit={() => undefined}
        onDelete={() => undefined}
        onTogglePin={() => undefined}
        onToggleCollapsed={() => undefined}
        onWriteEssay={onWriteEssay}
        onOpenEssay={onOpenEssay}
      />,
    )

    await user.click(screen.getByRole('button', { name: '자기소개서 작성' }))
    await user.click(screen.getByRole('button', { name: '자기소개서 바로가기' }))
    expect(onWriteEssay).toHaveBeenCalledTimes(1)
    expect(onOpenEssay).toHaveBeenCalledTimes(1)
  })
})

describe('essay board', () => {
  it('highlights the posting opened from an application', () => {
    const noop = () => undefined
    render(
      <EssayBoard
        items={[
          { id: '1', tab: 'essays', title: '서울시', subtitle: '지원동기', details: { item: '지원동기', essay: '공공을 위해' } },
          { id: '2', tab: 'essays', title: '경기도', subtitle: '성장과정', details: { item: '성장과정', essay: '동아리' } },
        ]}
        focusTitle="서울시"
        onEdit={noop}
        onDelete={noop}
        onDeleteEntry={noop}
        onTogglePin={noop}
      />,
    )

    expect(document.querySelector('[data-posting="서울시"]')?.className).toContain('is-focused')
    expect(document.querySelector('[data-posting="경기도"]')?.className).not.toContain('is-focused')
  })

  it('deletes an essay item on the board', async () => {
    const user = userEvent.setup()
    const onDeleteEntry = vi.fn()
    const noop = () => undefined
    render(
      <EssayBoard
        items={[{ id: '1', tab: 'essays', title: '서울시', details: { item: '지원동기', essay: '공공을 위해' } }]}
        onEdit={noop}
        onDelete={noop}
        onDeleteEntry={onDeleteEntry}
        onTogglePin={noop}
      />,
    )

    expect(screen.queryByRole('button', { name: '항목 추가' })).toBeNull()
    await user.click(screen.getByRole('button', { name: '항목 삭제' }))
    expect(onDeleteEntry).toHaveBeenCalledWith(expect.objectContaining({ title: '서울시' }), 0)
  })
})

describe('d-day card', () => {
  it('shows only upcoming schedules with a d-day label', () => {
    render(
      <DdayCard
        today="2026-09-08"
        schedules={[
          { id: 'past', title: '지난 마감', date: '2020-01-01', type: '지원', source: 'schedule' },
          { id: 'soon', title: '원서 접수', date: '2026-09-10', type: '지원', source: 'schedule' },
        ]}
      />,
    )

    expect(screen.queryByText('지난 마감')).toBeNull()
    expect(screen.getByText('원서 접수')).toBeTruthy()
    expect(screen.getByText('D-2')).toBeTruthy()
  })

  it('opens schedule details when an upcoming item is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const soon = { id: 'soon', title: '원서 접수', date: '2026-09-10', type: '지원' as const, source: 'schedule' as const }
    render(<DdayCard today="2026-09-08" schedules={[soon]} onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: /원서 접수/ }))
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'soon', title: '원서 접수' }))
  })
})

describe('confirm dialog', () => {
  it('asks before deleting', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<ConfirmDialog title="자료 삭제" message='"정보처리기사"을(를) 삭제할까요?' onConfirm={onConfirm} onClose={() => undefined} />)

    await user.click(screen.getByRole('button', { name: '삭제' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })
})

describe('modal escape', () => {
  it('closes the confirm dialog on escape', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<ConfirmDialog title="자료 삭제" message="삭제할까요?" onConfirm={() => undefined} onClose={onClose} />)

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })
})
