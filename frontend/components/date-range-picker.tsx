'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { dateKey, formatKoreanRange, monthDays, pad, scheduleSpan } from '@/lib/dates'

export default function DateRangePicker({
  startDate,
  endDate,
  rangeEnabled,
  onChange,
}: {
  startDate: string
  endDate: string
  rangeEnabled: boolean
  onChange: (next: { startDate: string; endDate: string; rangeEnabled: boolean }) => void
}) {
  const [month, setMonth] = useState(() => new Date(`${startDate}T00:00:00`))
  const today = dateKey(new Date())
  const days = monthDays(month)
  const span = scheduleSpan({ date: startDate, endDate: rangeEnabled ? endDate || startDate : startDate })

  const selectDay = (key: string) => {
    if (!rangeEnabled) {
      onChange({ startDate: key, endDate: key, rangeEnabled: false })
      return
    }
    if (!endDate || endDate === startDate) {
      const { start, end } = scheduleSpan({ date: startDate, endDate: key })
      onChange({ startDate: start, endDate: end, rangeEnabled: true })
      return
    }
    onChange({ startDate: key, endDate: key, rangeEnabled: true })
  }

  return (
    <div className="mini-cal">
      <div className="mini-cal-summary">{formatKoreanRange(startDate, rangeEnabled ? endDate || startDate : startDate, rangeEnabled)}</div>
      <div className="mini-cal-nav">
        <strong>
          {month.getFullYear()}년 {pad(month.getMonth() + 1)}월
        </strong>
        <div>
          <button type="button" className="mini-cal-today" onClick={() => selectDay(today)}>
            오늘
          </button>
          <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="이전 달">
            <ChevronLeft size={15} />
          </button>
          <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="다음 달">
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
      <div className="weekdays mini-cal-weekdays">
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="mini-cal-grid">
        {days.map((day, index) => {
          if (!day) return <span key={`empty-${index}`} />
          const key = dateKey(day)
          const inRange = rangeEnabled && endDate && key > span.start && key < span.end
          const isStart = key === span.start
          const isEnd = rangeEnabled && Boolean(endDate) && key === span.end
          return (
            <button
              key={key}
              type="button"
              className={`mini-cal-day ${day.getDay() === 0 ? 'sunday' : ''} ${key === today ? 'is-today' : ''} ${isStart || isEnd ? 'is-selected' : ''} ${inRange ? 'in-range' : ''} ${isStart && endDate && endDate !== startDate ? 'is-range-start' : ''} ${isEnd && endDate !== startDate ? 'is-range-end' : ''}`}
              aria-label={`${day.getMonth() + 1}월 ${day.getDate()}일 선택`}
              aria-pressed={isStart || isEnd}
              onClick={() => selectDay(key)}
            >
              {day.getDate()}
            </button>
          )
        })}
      </div>
      <div className="mini-cal-toggle">
        <span>종료일</span>
        <button
          type="button"
          role="switch"
          aria-checked={rangeEnabled}
          aria-label="종료일"
          className={`switch ${rangeEnabled ? 'on' : ''}`}
          onClick={() => onChange({ startDate, endDate: startDate, rangeEnabled: !rangeEnabled })}
        >
          <i />
        </button>
      </div>
    </div>
  )
}
