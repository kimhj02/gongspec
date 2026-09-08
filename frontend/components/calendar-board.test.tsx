/** @vitest-environment jsdom */

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import CalendarBoard from '@/components/calendar-board'
import ScheduleModal from '@/components/schedule-modal'
import { monthDays } from '@/lib/dates'

afterEach(() => cleanup())

describe('calendar board', () => {
  it('shows application exam dates as chips and opens a day on click', async () => {
    const user = userEvent.setup()
    const onSelectDay = vi.fn()
    render(
      <CalendarBoard
        month={new Date(2026, 8, 1)}
        setMonth={() => undefined}
        days={monthDays(new Date(2026, 8, 1))}
        today="2026-09-08"
        selectedDay={null}
        onSelectDay={onSelectDay}
        onSelectEvent={() => undefined}
        events={[
          { id: '1', title: '서울시 서류', date: '2026-09-10', type: '서류', source: 'application', resourceId: 'app-1' },
          { id: '2', title: '서울시 필기', date: '2026-09-20', type: '필기', source: 'application', resourceId: 'app-1' },
        ]}
      />,
    )

    expect(screen.getByText('서울시 서류')).toBeTruthy()
    expect(screen.getByText('서울시 필기')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /9월 10일/ }))
    expect(onSelectDay).toHaveBeenCalledWith('2026-09-10')
  })

  it('shows a multi-day schedule as one connected bar', () => {
    render(
      <CalendarBoard
        month={new Date(2026, 8, 1)}
        setMonth={() => undefined}
        days={monthDays(new Date(2026, 8, 1))}
        today="2026-09-08"
        selectedDay={null}
        onSelectDay={() => undefined}
        onSelectEvent={() => undefined}
        events={[{ id: '1', title: '연수', date: '2026-09-10', endDate: '2026-09-12', type: '개인', source: 'schedule' }]}
      />,
    )

    expect(screen.getAllByText('연수')).toHaveLength(1)
    expect((screen.getByRole('button', { name: '연수' }) as HTMLElement).style.gridColumn).toBe('5 / 8')
  })

  it('continues a range onto the next week', () => {
    render(
      <CalendarBoard
        month={new Date(2026, 8, 1)}
        setMonth={() => undefined}
        days={monthDays(new Date(2026, 8, 1))}
        today="2026-09-08"
        selectedDay={null}
        onSelectDay={() => undefined}
        onSelectEvent={() => undefined}
        events={[{ id: '1', title: '연수', date: '2026-09-12', endDate: '2026-09-14', type: '개인', source: 'schedule' }]}
      />,
    )

    expect(screen.getAllByText('연수')).toHaveLength(2)
  })

  it('opens an existing schedule when its bar is clicked', async () => {
    const user = userEvent.setup()
    const onSelectEvent = vi.fn()
    const event = { id: '1', title: '연수', date: '2026-09-10', endDate: '2026-09-12', type: '개인' as const, source: 'schedule' as const }
    render(
      <CalendarBoard
        month={new Date(2026, 8, 1)}
        setMonth={() => undefined}
        days={monthDays(new Date(2026, 8, 1))}
        today="2026-09-08"
        selectedDay={null}
        onSelectDay={() => undefined}
        onSelectEvent={onSelectEvent}
        events={[event]}
      />,
    )

    await user.click(screen.getByRole('button', { name: '연수' }))
    expect(onSelectEvent).toHaveBeenCalledWith(event)
  })

  it('marks a public holiday in red', () => {
    render(
      <CalendarBoard
        month={new Date(2026, 8, 1)}
        setMonth={() => undefined}
        days={monthDays(new Date(2026, 8, 1))}
        today="2026-09-08"
        selectedDay={null}
        holidays={{ '2026-09-25': '추석' }}
        onSelectDay={() => undefined}
        onSelectEvent={() => undefined}
        events={[]}
      />,
    )

    const holiday = screen.getByText('추석')
    expect(holiday.className).toContain('event-bar')
    expect(holiday.className).toContain('holiday')
    expect(screen.getByRole('button', { name: /9월 25일, 추석/ }).className).toContain('is-holiday')
  })

  it('shows consecutive holidays as one connected bar', () => {
    render(
      <CalendarBoard
        month={new Date(2026, 8, 1)}
        setMonth={() => undefined}
        days={monthDays(new Date(2026, 8, 1))}
        today="2026-09-08"
        selectedDay={null}
        holidays={{ '2026-09-24': '추석', '2026-09-25': '추석', '2026-09-26': '추석' }}
        onSelectDay={() => undefined}
        onSelectEvent={() => undefined}
        events={[]}
      />,
    )

    const bars = screen.getAllByText('추석')
    expect(bars).toHaveLength(1)
    expect(bars[0].style.gridColumn).toBe('5 / 8')
  })
})

describe('schedule modal', () => {
  it('lets a user register a personal schedule', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()
    render(
      <ScheduleModal
        date="2026-09-10"
        onClose={onClose}
        onSave={onSave}
      />,
    )

    expect(screen.getByRole('button', { name: /2026년 9월 10일 → 2026년 9월 10일/ })).toBeTruthy()
    await user.type(screen.getByPlaceholderText('제목 없음'), '스터디')
    await user.click(screen.getByRole('button', { name: '일정 추가' }))
    expect(onSave).toHaveBeenCalledWith({ title: '스터디', date: '2026-09-10', type: '개인' })
    expect(onClose).toHaveBeenCalled()
  })

  it('saves a memo with the schedule', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(
      <ScheduleModal
        date="2026-09-10"
        onClose={() => undefined}
        onSave={onSave}
      />,
    )

    await user.type(screen.getByPlaceholderText('제목 없음'), '스터디')
    await user.type(screen.getByPlaceholderText('일정에 대한 메모를 남겨 보세요.'), '3장까지 복습')
    await user.click(screen.getByRole('button', { name: '일정 추가' }))
    expect(onSave).toHaveBeenCalledWith({ title: '스터디', date: '2026-09-10', type: '개인', memo: '3장까지 복습' })
  })

  it('saves a consecutive date range', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(
      <ScheduleModal
        date="2026-09-10"
        onClose={() => undefined}
        onSave={onSave}
      />,
    )

    await user.type(screen.getByPlaceholderText('제목 없음'), '연수')
    await user.click(screen.getByRole('button', { name: /날짜/ }))
    await user.click(screen.getByRole('button', { name: '9월 12일 선택' }))
    await user.click(screen.getByRole('button', { name: '일정 추가' }))
    expect(onSave).toHaveBeenCalledWith({ title: '연수', date: '2026-09-10', endDate: '2026-09-12', type: '개인' })
  })

  it('can turn off the end date and save a single day', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(
      <ScheduleModal
        date="2026-09-10"
        onClose={() => undefined}
        onSave={onSave}
      />,
    )

    await user.type(screen.getByPlaceholderText('제목 없음'), '면담')
    await user.click(screen.getByRole('button', { name: /날짜/ }))
    await user.click(screen.getByRole('switch', { name: '종료일' }))
    await user.click(screen.getByRole('button', { name: '9월 12일 선택' }))
    await user.click(screen.getByRole('button', { name: '일정 추가' }))
    expect(onSave).toHaveBeenCalledWith({ title: '면담', date: '2026-09-12', type: '개인' })
  })

  it('lets a user edit an existing schedule', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()
    const onDelete = vi.fn()
    render(
      <ScheduleModal
        event={{ id: '1', title: '연수', date: '2026-09-10', endDate: '2026-09-12', type: '개인', source: 'schedule', memo: '3장까지 복습' }}
        onClose={onClose}
        onSave={onSave}
        onDelete={onDelete}
      />,
    )

    expect(screen.getByDisplayValue('연수')).toBeTruthy()
    expect(screen.getByText('2026년 9월 10일 → 2026년 9월 12일')).toBeTruthy()
    expect(screen.getByDisplayValue('3장까지 복습')).toBeTruthy()
    expect(screen.queryByRole('button', { name: '일정 추가' })).toBeNull()
    await user.clear(screen.getByDisplayValue('연수'))
    await user.type(screen.getByPlaceholderText('제목 없음'), '실무 연수')
    await user.click(screen.getByRole('button', { name: '일정 저장' }))
    expect(onSave).toHaveBeenCalledWith({ title: '실무 연수', date: '2026-09-10', endDate: '2026-09-12', type: '개인', memo: '3장까지 복습' })
    expect(onClose).toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: '삭제' }))
    expect(onDelete).toHaveBeenCalled()
  })
})
