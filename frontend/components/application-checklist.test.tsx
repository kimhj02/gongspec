/** @vitest-environment jsdom */

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ResourceForm from '@/components/resource-form'
import ResourceCard from '@/components/resource-card'
import { parseChecklist } from '@/lib/application-checklist'
import type { Resource } from '@/lib/api'

afterEach(cleanup)

const initial: Resource = {
  id: 'app-1', tab: 'applications', title: '사무직 공채',
  details: {
    institution: '한국전력공사', posting: '사무직 공채', documentAt: '2026-10-01', writtenAt: '2026-10-15',
    checklist: JSON.stringify([
      { id: '1', title: '자기소개서 작성', completed: false },
      { id: '2', title: '증빙서류 준비', completed: true },
    ]),
  },
}

describe('application checklist', () => {
  it('creates checklist items, ignores empty rows, and restores them when reopening', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    const { unmount } = render(<ResourceForm initial={null} activeTab="applications" defaultDetails={{ institution: '한국전력공사', posting: '사무직 공채' }} onClose={vi.fn()} onSave={onSave} />)
    await user.click(screen.getByRole('button', { name: '항목 추가' }))
    await user.type(screen.getByRole('textbox', { name: '체크리스트 항목 1' }), '  자기소개서 작성  ')
    await user.click(screen.getByRole('button', { name: '항목 추가' }))
    await user.click(screen.getByRole('button', { name: '추가' }))
    const saved = onSave.mock.calls[0][0] as Omit<Resource, 'id'>
    expect(parseChecklist(saved.details?.checklist)).toEqual([{ id: expect.any(String), title: '자기소개서 작성', completed: false }])
    unmount()
    render(<ResourceForm initial={{ ...saved, id: 'saved' }} activeTab="applications" onClose={vi.fn()} onSave={onSave} />)
    expect(screen.getByDisplayValue('자기소개서 작성')).toBeTruthy()
    expect(screen.getByText('0/1 완료')).toBeTruthy()
  })

  it('saves completion and deletion while preserving dates from other stages', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<ResourceForm initial={initial} activeTab="applications" onClose={vi.fn()} onSave={onSave} />)
    expect(screen.getByText('1/2 완료')).toBeTruthy()
    await user.click(screen.getByRole('checkbox', { name: '자기소개서 작성 완료' }))
    await user.click(screen.getByRole('button', { name: '증빙서류 준비 삭제' }))
    await user.click(screen.getByRole('tab', { name: '면접' }))
    await user.click(screen.getByRole('button', { name: '수정' }))
    const saved = onSave.mock.calls[0][0] as Resource
    expect(parseChecklist(saved.details?.checklist)).toEqual([{ id: '1', title: '자기소개서 작성', completed: true }])
    expect(saved.details).toMatchObject({ documentAt: '2026-10-01', writtenAt: '2026-10-15' })
  })

  it('can uncheck completed items and remove the last item', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<ResourceForm initial={initial} activeTab="applications" onClose={vi.fn()} onSave={onSave} />)
    await user.click(screen.getByRole('checkbox', { name: '증빙서류 준비 완료' }))
    expect(screen.getByText('0/2 완료')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: '자기소개서 작성 삭제' }))
    await user.click(screen.getByRole('button', { name: '증빙서류 준비 삭제' }))
    await user.click(screen.getByRole('button', { name: '수정' }))
    expect(onSave.mock.calls[0][0].details.checklist).toBe('[]')
  })

  it('keeps unsaved changes after a save failure and allows retry', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockRejectedValueOnce(new Error('저장 실패')).mockResolvedValueOnce(undefined)
    render(<ResourceForm initial={initial} activeTab="applications" onClose={vi.fn()} onSave={onSave} />)
    await user.click(screen.getByRole('checkbox', { name: '자기소개서 작성 완료' }))
    await user.click(screen.getByRole('button', { name: '수정' }))
    expect(screen.getByText('2/2 완료')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: '수정' }))
    expect(onSave).toHaveBeenCalledTimes(2)
    expect(onSave.mock.calls[1][0]).toEqual(onSave.mock.calls[0][0])
  })

  it('shows progress on a collapsed application card only', () => {
    const props = { collapsed: true, onEdit: vi.fn(), onDelete: vi.fn(), onTogglePin: vi.fn(), onToggleCollapsed: vi.fn() }
    const { rerender } = render(<ResourceCard item={initial} {...props} />)
    expect(screen.getByText('준비 체크리스트 1/2 완료')).toBeTruthy()
    rerender(<ResourceCard item={{ ...initial, tab: 'memo' }} {...props} />)
    expect(screen.queryByText(/준비 체크리스트/)).toBeNull()
  })
})
