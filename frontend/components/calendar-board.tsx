'use client'

import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { eventTypeClass, type CalendarEvent } from '@/lib/calendar-events'
import { chunkWeeks, layoutWeekEvents } from '@/lib/calendar-layout'
import { dateKey, isOnDay, pad } from '@/lib/dates'
import { holidayEventsFrom, type HolidayMap } from '@/lib/korean-holidays'

export default function CalendarBoard({
  month,
  setMonth,
  days,
  events,
  today,
  selectedDay,
  holidays = {},
  onSelectDay,
  onSelectEvent,
}: {
  month: Date
  setMonth: (date: Date) => void
  days: (Date | null)[]
  events: CalendarEvent[]
  today: string
  selectedDay: string | null
  holidays?: HolidayMap
  onSelectDay: (day: string) => void
  onSelectEvent: (event: CalendarEvent) => void
}) {
  const holidayEvents = holidayEventsFrom(holidays)

  return (
    <section className="calendar-board">
      <div className="calendar-board-nav">
        <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="이전 달">
          <ChevronLeft size={16} />
        </button>
        <strong>
          {month.getFullYear()}년 {pad(month.getMonth() + 1)}월
        </strong>
        <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="다음 달">
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="calendar-legend">
        <span>
          <i className="dot holiday" /> 공휴일
        </span>
        <span>
          <i className="dot document" /> 서류
        </span>
        <span>
          <i className="dot written" /> 필기
        </span>
        <span>
          <i className="dot interview" /> 면접
        </span>
        <span>
          <i className="dot personal" /> 일정
        </span>
      </div>
      <div className="weekdays calendar-weekdays">
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="calendar-month">
        {chunkWeeks(days).map((week, weekIndex) => {
          const holidayLayout = layoutWeekEvents(week, holidayEvents, 2)
          const { segments, overflowByCol } = layoutWeekEvents(week, events)
          const holidayLanes = holidayLayout.segments.reduce((max, item) => Math.max(max, item.lane + 1), 0)
          const laneCount = segments.reduce((max, item) => Math.max(max, item.lane + 1), 0)
          const overflowRows = overflowByCol.some(Boolean) ? 1 : 0
          const rows = holidayLanes + laneCount + overflowRows
          return (
            <div className="calendar-week" key={weekIndex}>
              <div className="calendar-week-days">
                {week.map((day, index) => {
                  if (!day) return <div key={`empty-${weekIndex}-${index}`} className="calendar-cell is-empty" />
                  const key = dateKey(day)
                  const count = events.filter((event) => isOnDay(event, key)).length
                  const holiday = holidays[key]
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`calendar-cell ${day.getDay() === 0 ? 'sunday' : ''} ${holiday ? 'is-holiday' : ''} ${key === today ? 'is-today' : ''} ${selectedDay === key ? 'selected' : ''}`}
                      title={holiday}
                      aria-label={`${day.getMonth() + 1}월 ${day.getDate()}일${holiday ? `, ${holiday}` : ''}${count ? `, 일정 ${count}개` : ''}`}
                      onClick={() => onSelectDay(key)}
                    >
                      <span className="calendar-date">{day.getDate()}</span>
                    </button>
                  )
                })}
              </div>
              {rows ? (
                <div className="calendar-week-events" style={{ gridTemplateRows: `repeat(${rows}, 18px)` }}>
                  {holidayLayout.segments.map((segment) => (
                    <span
                      key={`${weekIndex}-${segment.event.id}`}
                      className={`event-bar holiday ${segment.continuesLeft ? 'is-continue-left' : ''} ${segment.continuesRight ? 'is-continue-right' : ''}`}
                      style={{ gridColumn: `${segment.startCol + 1} / ${segment.endCol + 2}`, gridRow: segment.lane + 1 }}
                    >
                      {segment.event.title}
                    </span>
                  ))}
                  {segments.map((segment) => (
                    <button
                      type="button"
                      key={`${weekIndex}-${segment.event.id}`}
                      className={`event-bar ${eventTypeClass(segment.event.type, segment.event.source)} ${segment.continuesLeft ? 'is-continue-left' : ''} ${segment.continuesRight ? 'is-continue-right' : ''}`}
                      style={{
                        gridColumn: `${segment.startCol + 1} / ${segment.endCol + 2}`,
                        gridRow: holidayLanes + segment.lane + 1,
                      }}
                      aria-label={segment.event.title}
                      onClick={() => onSelectEvent(segment.event)}
                    >
                      {segment.event.title}
                    </button>
                  ))}
                  {overflowByCol.map((count, col) => {
                    const day = week[col]
                    if (!count || !day) return null
                    const key = dateKey(day)
                    return (
                      <button
                        type="button"
                        key={`${weekIndex}-more-${key}`}
                        className="event-more"
                        style={{ gridColumn: col + 1, gridRow: holidayLanes + laneCount + 1 }}
                        aria-label={`${day.getMonth() + 1}월 ${day.getDate()}일 일정 더보기`}
                        onClick={() => onSelectDay(key)}
                      >
                        +{count}
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
      <p className="calendar-hint">
        <CalendarDays size={14} /> 날짜를 눌러 일정을 추가하거나, 지원 현황의 서류·필기·면접 날짜가 자동으로 표시됩니다.
      </p>
    </section>
  )
}
