'use client'

import { eventTypeClass, type CalendarEvent } from '@/lib/calendar-events'
import { ddayLabel, formatSchedulePeriod, upcomingSchedules } from '@/lib/dates'

export default function DdayCard({
  schedules,
  today,
  onSelect,
}: {
  schedules: CalendarEvent[]
  today?: string
  onSelect?: (event: CalendarEvent) => void
}) {
  const upcoming = upcomingSchedules(schedules, today)

  return (
    <section className="side-card dday-card">
      <div className="side-card-header">
        <div className="page-intro-copy">
          <div className="eyebrow">UP NEXT</div>
          <h2>다가오는 일정</h2>
        </div>
      </div>
      {upcoming.length ? (
        <div className="dday-list">
          {upcoming.map((schedule) => (
            <button type="button" className="dday-item" key={schedule.id} onClick={() => onSelect?.(schedule)}>
              <div className={`dday-mark ${eventTypeClass(schedule.type)}`}>
                <span>{schedule.type === '개인' ? '·' : 'D'}</span>
              </div>
              <div className="dday-copy">
                <strong>{schedule.title}</strong>
                <span>{formatSchedulePeriod(schedule)}</span>
              </div>
              <b className="dday-badge">{ddayLabel(schedule.daysLeft)}</b>
            </button>
          ))}
        </div>
      ) : (
        <p className="dday-empty">다가오는 일정이 없습니다. 날짜를 눌러 일정을 추가해 보세요.</p>
      )}
    </section>
  )
}
