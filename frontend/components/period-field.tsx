'use client'

import { useState } from 'react'
import DateRangePicker from '@/components/date-range-picker'
import { formatKoreanRange } from '@/lib/dates'

export default function PeriodField({
  label,
  startDate,
  endDate,
  onChange,
}: {
  label: string
  startDate: string
  endDate: string
  onChange: (next: { startDate: string; endDate: string }) => void
}) {
  const [open, setOpen] = useState(false)
  const [rangeEnabled, setRangeEnabled] = useState(() => !startDate || startDate !== endDate)
  const summary = startDate
    ? formatKoreanRange(startDate, rangeEnabled ? endDate || startDate : startDate, rangeEnabled)
    : '달력에서 선택'

  return (
    <div className="period-field">
      <span>{label}</span>
      <button
        type="button"
        className={`period-trigger ${open ? 'is-open' : ''}`}
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((current) => !current)}
      >
        {startDate ? summary : <em>{summary}</em>}
      </button>
      {open ? (
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          rangeEnabled={rangeEnabled}
          hideSummary
          onChange={(next) => {
            setRangeEnabled(next.rangeEnabled)
            onChange({
              startDate: next.startDate,
              endDate: next.rangeEnabled ? next.endDate : next.startDate,
            })
          }}
        />
      ) : null}
    </div>
  )
}
