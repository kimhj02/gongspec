'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, StickyNote, X } from 'lucide-react'
import DateRangePicker from '@/components/date-range-picker'
import ModalShell from '@/components/modal-shell'
import type { CalendarEvent } from '@/lib/calendar-events'
import type { Schedule } from '@/lib/api'
import { formatKoreanRange, scheduleSpan } from '@/lib/dates'

export default function ScheduleModal({
  date,
  event,
  onClose,
  onSave,
  onDelete,
}: {
  date?: string
  event?: CalendarEvent
  onClose: () => void
  onSave: (schedule: Omit<Schedule, 'id'>) => Promise<void>
  onDelete?: (event: CalendarEvent) => void
}) {
  const editing = Boolean(event)
  const initial = event ? scheduleSpan(event) : { start: date ?? '', end: date ?? '' }
  const [title, setTitle] = useState(event?.title ?? '')
  const [startDate, setStartDate] = useState(initial.start)
  const [endDate, setEndDate] = useState(initial.end)
  const [rangeEnabled, setRangeEnabled] = useState(() => (event ? initial.start !== initial.end : true))
  const [memo, setMemo] = useState(event?.memo ?? '')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!pickerOpen) return
    const onKeyDown = (change: KeyboardEvent) => {
      if (change.key !== 'Escape') return
      change.stopImmediatePropagation()
      setPickerOpen(false)
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [pickerOpen])

  const submit = async (formEvent: React.FormEvent) => {
    formEvent.preventDefault()
    if (!title.trim() || !startDate) return
    const { start, end } = scheduleSpan({ date: startDate, endDate: rangeEnabled ? endDate || startDate : startDate })
    setSaving(true)
    try {
      const schedule: Omit<Schedule, 'id'> = { title: title.trim(), date: start, type: event?.type ?? '개인' }
      if (end !== start) schedule.endDate = end
      if (memo.trim()) schedule.memo = memo.trim()
      await onSave(schedule)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalShell onClose={onClose} labelledBy="schedule-title" className="small-modal schedule-page-modal">
      <div className="modal-header">
        <div className="eyebrow">일정</div>
        <button className="icon-button" onClick={onClose} aria-label="닫기">
          <X size={18} />
        </button>
      </div>
      <form className="schedule-form" onSubmit={(formEvent) => void submit(formEvent)}>
        <input
          id="schedule-title"
          className="schedule-title-input"
          value={title}
          onChange={(change) => setTitle(change.target.value)}
          placeholder="제목 없음"
          autoFocus
          required
        />
        <div className="property-list">
          <button
            type="button"
            className={`property-row ${pickerOpen ? 'is-open' : ''}`}
            aria-expanded={pickerOpen}
            onClick={() => setPickerOpen((open) => !open)}
          >
            <span className="property-icon">
              <CalendarDays size={15} />
            </span>
            <span>날짜</span>
            <strong>{formatKoreanRange(startDate, rangeEnabled ? endDate || startDate : startDate, rangeEnabled)}</strong>
          </button>
          {pickerOpen ? (
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              rangeEnabled={rangeEnabled}
              onChange={(next) => {
                setStartDate(next.startDate)
                setEndDate(next.endDate)
                setRangeEnabled(next.rangeEnabled)
              }}
            />
          ) : null}
          <div className="property-memo">
            <div className="property-row is-static">
              <span className="property-icon">
                <StickyNote size={15} />
              </span>
              <span>메모</span>
            </div>
            <textarea
              className="schedule-memo"
              value={memo}
              onChange={(change) => setMemo(change.target.value)}
              placeholder="일정에 대한 메모를 남겨 보세요."
              rows={5}
              aria-label="메모"
            />
          </div>
        </div>
        <div className="form-actions">
          {editing && onDelete && event ? (
            <button type="button" className="primary-button danger-button" onClick={() => onDelete(event)}>
              삭제
            </button>
          ) : null}
          <button className="primary-button" aria-label={editing ? '일정 저장' : '일정 추가'} disabled={saving || !title.trim()}>
            {saving ? '저장 중...' : editing ? '저장' : '추가'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}
