'use client'

import { useCallback, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react'
import ModalShell from '@/components/modal-shell'
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
  const [overflowDay, setOverflowDay] = useState<string | null>(null)
  const overflowTrigger = useRef<HTMLButtonElement | null>(null)
  const closeOverflow = useCallback(() => {
    setOverflowDay(null)
    overflowTrigger.current?.focus()
  }, [])
  const weeks = chunkWeeks(days).map((week) => ({
    week,
    ...layoutWeekEvents(week, [...holidayEvents, ...events]),
  }))
  const overflowWeek = weeks.find(({ week }) => week.some((day) => day && dateKey(day) === overflowDay))
  const overflowCol = overflowWeek?.week.findIndex((day) => day && dateKey(day) === overflowDay) ?? -1
  const hiddenEvents = overflowWeek?.hiddenEventsByCol[overflowCol] ?? []

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
        {weeks.map(({ week, segments, overflowByCol, hiddenEventsByCol }, weekIndex) => {
          const holidaySegments = segments.filter((item) => item.event.source === 'holiday')
          const eventSegments = segments.filter((item) => item.event.source !== 'holiday')
          const laneCount = segments.reduce((max, item) => Math.max(max, item.lane + 1), 0)
          const overflowRows = overflowByCol.some(Boolean) ? 1 : 0
          const rows = laneCount + overflowRows
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
                  {holidaySegments.map((segment) => (
                    <span
                      key={`${weekIndex}-${segment.event.id}`}
                      className={`event-bar holiday ${segment.continuesLeft ? 'is-continue-left' : ''} ${segment.continuesRight ? 'is-continue-right' : ''}`}
                      style={{ gridColumn: `${segment.startCol + 1} / ${segment.endCol + 2}`, gridRow: segment.lane + 1 }}
                    >
                      {segment.event.title}
                    </span>
                  ))}
                  {eventSegments.map((segment) => (
                    <button
                      type="button"
                      key={`${weekIndex}-${segment.event.id}`}
                      className={`event-bar ${eventTypeClass(segment.event.type, segment.event.source)} ${segment.continuesLeft ? 'is-continue-left' : ''} ${segment.continuesRight ? 'is-continue-right' : ''}`}
                      style={{
                        gridColumn: `${segment.startCol + 1} / ${segment.endCol + 2}`,
                        gridRow: segment.lane + 1,
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
                    const hidden = hiddenEventsByCol[col]
                    const directEvent = hidden.length === 1 && hidden[0].source !== 'holiday' ? hidden[0] : null
                    return (
                      <button
                        type="button"
                        key={`${weekIndex}-more-${key}`}
                        className="event-more"
                        style={{ gridColumn: col + 1, gridRow: laneCount + 1 }}
                        aria-label={directEvent
                          ? `${day.getMonth() + 1}월 ${day.getDate()}일 ${directEvent.title} 상세 화면으로 이동`
                          : `${day.getMonth() + 1}월 ${day.getDate()}일 일정 더보기`}
                        onClick={(click) => {
                          if (directEvent) {
                            onSelectEvent(directEvent)
                          } else {
                            overflowTrigger.current = click.currentTarget
                            setOverflowDay(key)
                          }
                        }}
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
      {overflowDay && hiddenEvents.length > 0 && (
        <ModalShell onClose={closeOverflow} labelledBy="calendar-overflow-title" className="small-modal">
          <div className="modal-header">
            <h2 id="calendar-overflow-title">{overflowDay} 숨겨진 일정</h2>
            <button type="button" className="icon-button" onClick={closeOverflow} aria-label="닫기" autoFocus>
              <X size={18} />
            </button>
          </div>
          <ul className="calendar-overflow-list">
            {hiddenEvents.map((event) => (
              <li key={event.id}>
                {event.source === 'holiday' ? (
                  <span className="event-bar holiday">{event.title}</span>
                ) : (
                  <button
                    type="button"
                    className={`event-bar ${eventTypeClass(event.type, event.source)}`}
                    onClick={() => {
                      closeOverflow()
                      onSelectEvent(event)
                    }}
                  >
                    {event.title}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </ModalShell>
      )}
      <p className="calendar-hint">
        <CalendarDays size={14} /> 날짜를 눌러 일정을 추가하거나, 지원 현황의 서류·필기·면접 날짜가 자동으로 표시됩니다.
      </p>
    </section>
  )
}
