/** @vitest-environment jsdom */

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ResourceForm from '@/components/resource-form'
import DdayCard from '@/components/dday-card'
import ResourceCard from '@/components/resource-card'
import ConfirmDialog from '@/components/confirm-dialog'

afterEach(() => {
  cleanup()
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

  it('hides the title field when a tab already has a name', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<ResourceForm initial={null} activeTab="education" onClose={() => undefined} onSave={onSave} />)

    expect(screen.queryByPlaceholderText('자료 제목')).toBeNull()
    await user.type(screen.getByPlaceholderText('과목명'), '헌법')
    await user.click(screen.getByRole('button', { name: /추가/ }))

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ tab: 'education', title: '헌법' }))
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

    await user.type(screen.getByPlaceholderText('기관명'), '서울시')
    await user.click(screen.getByRole('tab', { name: '필기' }))
    expect(screen.getByText('필기 시험일')).toBeTruthy()
    expect(screen.queryByText('서류 마감일')).toBeNull()

    await user.type(screen.getByLabelText('필기 시험일'), '2026-09-20')
    await user.click(screen.getByRole('button', { name: /추가/ }))

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        tab: 'applications',
        title: '서울시',
        details: expect.objectContaining({ institution: '서울시', writtenAt: '2026-09-20' }),
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

    await user.type(screen.getByPlaceholderText('예: 서울시 9급'), '서울시 9급')
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
