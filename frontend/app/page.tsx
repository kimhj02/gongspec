'use client'

import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import { Archive, CalendarDays, Moon, Plus, Search, Sun, X } from 'lucide-react'
import AppNotice, { type Notice } from '@/components/app-notice'
import CalendarBoard from '@/components/calendar-board'
import ConfirmDialog from '@/components/confirm-dialog'
import DdayCard from '@/components/dday-card'
import EssayBoard from '@/components/essay-board'
import LoginGate from '@/components/login-gate'
import ResourceCard from '@/components/resource-card'
import ResourceForm from '@/components/resource-form'
import ScheduleModal from '@/components/schedule-modal'
import { useAuth } from '@/hooks/use-auth'
import { useDebouncedValue } from '@/hooks/use-debounce'
import { useTheme } from '@/hooks/use-theme'
import { useKoreanHolidays } from '@/hooks/use-korean-holidays'
import { api, applicationsKey, getApiError, resourceKey, schedulesKey, type NavId, type Resource, type Schedule } from '@/lib/api'
import { mergeCalendarEvents, type CalendarEvent } from '@/lib/calendar-events'
import { dateKey, monthDays } from '@/lib/dates'
import { overlayApplication, parseEssayEntries, toEssayPayload } from '@/lib/resource-fields'
import { calendarNav, resourceTabs, tabCopy, tabLabel } from '@/lib/tabs'

type PendingDelete =
  | { kind: 'resource'; id: string; title: string; extraIds?: string[] }
  | { kind: 'schedule'; id: string; title: string }

export default function Page() {
  const { theme, toggleTheme } = useTheme()
  const { user, isLoading: authLoading, pending: authPending, error: authError, login, logout, mutate: mutateAuth } = useAuth()
  const [activeTab, setActiveTab] = useState<NavId>('calendar')
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 300)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Resource | null>(null)
  const [draftTitle, setDraftTitle] = useState('')
  const [appendEssayEntry, setAppendEssayEntry] = useState(false)
  const [essayExtraIds, setEssayExtraIds] = useState<string[]>([])
  const [month, setMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [notice, setNotice] = useState<Notice | null>(null)
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null)
  const isCalendar = activeTab === 'calendar'
  const resourceTab = isCalendar ? null : activeTab

  const resources = useSWR(
    user && resourceTab ? resourceKey(resourceTab, debouncedQuery) : null,
    ([, tab, nextQuery]) => api.resources.list({ tab, query: nextQuery }),
    { revalidateOnFocus: false, keepPreviousData: true },
  )
  const applications = useSWR(user ? applicationsKey : null, () => api.resources.list({ tab: 'applications' }), { revalidateOnFocus: false })
  const schedules = useSWR(user ? schedulesKey : null, () => api.schedules.list(), { revalidateOnFocus: false })
  const days = useMemo(() => monthDays(month), [month])
  const holidays = useKoreanHolidays(month.getFullYear())
  const events = useMemo(
    () => mergeCalendarEvents(schedules.data ?? [], applications.data ?? []),
    [applications.data, schedules.data],
  )
  const today = dateKey(new Date())

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 4000)
    return () => window.clearTimeout(timer)
  }, [notice])

  const startLogin = async () => {
    try {
      await login()
    } catch (error) {
      setNotice({ type: 'error', message: getApiError(error) })
    }
  }

  const startLogout = async () => {
    try {
      await logout()
      setNotice({ type: 'success', message: '로그아웃했습니다.' })
    } catch (error) {
      setNotice({ type: 'error', message: getApiError(error) })
    }
  }

  const openCreate = () => {
    setEditing(null)
    setDraftTitle('')
    setAppendEssayEntry(false)
    setEssayExtraIds([])
    setShowForm(true)
  }

  const openEssayEditor = (posting: Resource, appendEmptyEntry = false) => {
    const group = (resources.data ?? []).filter((item) => item.title === posting.title)
    setEditing(posting)
    setDraftTitle('')
    setAppendEssayEntry(appendEmptyEntry)
    setEssayExtraIds(group.slice(1).map((item) => item.id))
    setShowForm(true)
  }

  const saveResource = async (data: Omit<Resource, 'id'>) => {
    if (editing) {
      await api.resources.update(editing.id, data)
      await Promise.all(essayExtraIds.map((id) => api.resources.remove(id)))
    } else if (data.tab === 'essays') {
      const existing = (resources.data ?? []).find((item) => item.title.trim() === data.title.trim())
      if (existing) {
        const merged = [...parseEssayEntries(existing), ...parseEssayEntries(data)]
        await api.resources.update(existing.id, toEssayPayload(data.title, merged))
      } else {
        await api.resources.create(data)
      }
    } else if (data.tab === 'applications') {
      const existing = (resources.data ?? []).find((item) => item.title.trim() === data.title.trim())
      if (existing) {
        await api.resources.update(existing.id, overlayApplication(existing, data))
      } else {
        await api.resources.create(data)
      }
    } else {
      await api.resources.create(data)
    }
    await Promise.all([resources.mutate(), applications.mutate()])
    setShowForm(false)
    setEditing(null)
    setDraftTitle('')
    setAppendEssayEntry(false)
    setEssayExtraIds([])
    setNotice({ type: 'success', message: editing ? '자료를 수정했습니다.' : '자료를 추가했습니다.' })
  }

  const togglePin = async (item: Resource) => {
    try {
      await api.resources.update(item.id, { pinned: !item.pinned })
      await resources.mutate()
    } catch (error) {
      setNotice({ type: 'error', message: getApiError(error) })
    }
  }

  const addSchedule = async (schedule: Omit<Schedule, 'id'>) => {
    try {
      await api.schedules.create(schedule)
      await schedules.mutate()
      setNotice({ type: 'success', message: '일정을 추가했습니다.' })
    } catch (error) {
      setNotice({ type: 'error', message: getApiError(error) })
      throw error
    }
  }

  const updateSchedule = async (schedule: Omit<Schedule, 'id'>) => {
    if (!selectedEvent) return
    try {
      await api.schedules.update(selectedEvent.id, schedule)
      await schedules.mutate()
      setNotice({ type: 'success', message: '일정을 수정했습니다.' })
    } catch (error) {
      setNotice({ type: 'error', message: getApiError(error) })
      throw error
    }
  }

  const openApplication = (resourceId: string) => {
    const item = (applications.data ?? []).find((resource) => resource.id === resourceId)
    if (!item) return
    setSelectedDay(null)
    setSelectedEvent(null)
    setEditing(item)
    setShowForm(true)
  }

  const selectCalendarEvent = (event: CalendarEvent) => {
    if (event.resourceId) {
      openApplication(event.resourceId)
      return
    }
    setSelectedDay(null)
    setSelectedEvent(event)
  }

  const closeScheduleDialog = () => {
    setSelectedDay(null)
    setSelectedEvent(null)
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    try {
      if (pendingDelete.kind === 'resource') {
        await api.resources.remove(pendingDelete.id)
        await Promise.all((pendingDelete.extraIds ?? []).map((id) => api.resources.remove(id)))
        await Promise.all([resources.mutate(), applications.mutate()])
      } else {
        await api.schedules.remove(pendingDelete.id)
        await schedules.mutate()
      }
      setNotice({ type: 'success', message: `${pendingDelete.title}을(를) 삭제했습니다.` })
    } catch (error) {
      setNotice({ type: 'error', message: getApiError(error) })
    } finally {
      setPendingDelete(null)
      if (pendingDelete.kind === 'schedule') closeScheduleDialog()
    }
  }

  return (
    <div className={`app-shell ${theme === 'dark' ? 'theme-dark' : ''}`}>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-mark">
              <Archive size={18} />
            </div>
            <div>
              <strong>GongSpec</strong>
              <span>공기업 스펙 정리 사이트</span>
            </div>
          </div>
          <div className="top-actions">
            {user ? (
              <>
                <span className="user-chip">{user.nickname}</span>
                <button className="auth-action" onClick={() => void startLogout()} disabled={authPending}>
                  로그아웃
                </button>
              </>
            ) : (
              <button className="kakao-button" onClick={() => void startLogin()} disabled={authPending || authLoading}>
                카카오로 시작하기
              </button>
            )}
            <button className="icon-button" aria-label="테마 전환" onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            </button>
          </div>
        </div>
      </header>

      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-heading">
            <span>일정</span>
          </div>
          <nav className="tabs-nav" aria-label="일정">
            <button className={`nav-item ${isCalendar ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>
              <CalendarDays size={17} />
              <span>{calendarNav.label}</span>
            </button>
          </nav>
          <div className="sidebar-heading">
            <span>자료실</span>
          </div>
          <nav className="tabs-nav" aria-label="자료 분류">
            {resourceTabs.map(({ id, label, icon: Icon }) => (
              <button key={id} className={`nav-item ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>
                <Icon size={17} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="main-content">
          {authLoading ? (
            <LoadingState />
          ) : authError ? (
            <InlineError message={getApiError(authError)} onRetry={() => void mutateAuth()} />
          ) : !user ? (
            <LoginGate onLogin={() => void startLogin()} pending={authPending} />
          ) : (
            <>
          <section className="page-intro">
            <div className="page-intro-copy">
              <div className="eyebrow">{tabCopy[activeTab].eyebrow}</div>
              <h1>{tabLabel(activeTab)}</h1>
              <p>{tabCopy[activeTab].intro}</p>
            </div>
            {!isCalendar ? (
              <button className="primary-button" onClick={openCreate}>
                <Plus size={17} /> {tabCopy[activeTab].createLabel}
              </button>
            ) : null}
          </section>

          {isCalendar ? (
            schedules.error || applications.error ? (
              <InlineError
                message={getApiError(schedules.error || applications.error)}
                onRetry={() => {
                  void schedules.mutate()
                  void applications.mutate()
                }}
              />
            ) : (
              <div className="calendar-page">
                <DdayCard schedules={events} onSelect={selectCalendarEvent} />
                <CalendarBoard
                  month={month}
                  setMonth={setMonth}
                  days={days}
                  events={events}
                  today={today}
                  selectedDay={selectedDay ?? selectedEvent?.date ?? null}
                  holidays={holidays.data ?? {}}
                  onSelectDay={(day) => {
                    setSelectedEvent(null)
                    setSelectedDay(day)
                  }}
                  onSelectEvent={selectCalendarEvent}
                />
              </div>
            )
          ) : (
            <>
              <div className="toolbar">
                <div className="search-field">
                  <Search size={17} />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="자료 검색하기" aria-label="자료 검색" />
                  {query ? (
                    <button onClick={() => setQuery('')} aria-label="검색어 지우기">
                      <X size={15} />
                    </button>
                  ) : null}
                </div>
                <div className="view-caption">
                  <span>{resources.data?.length ?? 0}개의 {tabCopy[activeTab].countLabel}</span>
                </div>
              </div>
              {resources.error ? (
                <InlineError message={getApiError(resources.error)} onRetry={() => void resources.mutate()} />
              ) : resources.isLoading && !resources.data ? (
                <LoadingState />
              ) : resources.data?.length ? (
                resourceTab === 'essays' ? (
                  <EssayBoard
                    items={resources.data}
                    onAddItem={(posting) => openEssayEditor(posting, true)}
                    onEdit={(item) => openEssayEditor(item)}
                    onDelete={(group) =>
                      setPendingDelete({
                        kind: 'resource',
                        id: group[0].id,
                        title: group[0].title,
                        extraIds: group.slice(1).map((item) => item.id),
                      })
                    }
                    onTogglePin={(item) => void togglePin(item)}
                  />
                ) : (
                  <div className="resource-grid">
                    {resources.data.map((item) => (
                      <ResourceCard
                        key={item.id}
                        item={item}
                        collapsed={Boolean(collapsed[item.id])}
                        onEdit={() => {
                          setDraftTitle('')
                          setEditing(item)
                          setShowForm(true)
                        }}
                        onDelete={() => setPendingDelete({ kind: 'resource', id: item.id, title: item.title })}
                        onTogglePin={() => void togglePin(item)}
                        onToggleCollapsed={() => setCollapsed((current) => ({ ...current, [item.id]: !current[item.id] }))}
                      />
                    ))}
                  </div>
                )
              ) : (
                <EmptyState
                  onAdd={openCreate}
                  title={tabCopy[activeTab].emptyTitle}
                  description={tabCopy[activeTab].emptyDescription}
                  actionLabel={tabCopy[activeTab].createLabel}
                />
              )}
            </>
          )}
            </>
          )}
        </main>
      </div>

      {notice ? <AppNotice notice={notice} onClose={() => setNotice(null)} /> : null}
      {showForm && (editing || resourceTab) ? (
        <ResourceForm
          initial={editing}
          activeTab={editing?.tab ?? resourceTab ?? 'memo'}
          defaultTitle={draftTitle}
          appendEmptyEntry={appendEssayEntry}
          postingNames={[...new Set([...(applications.data ?? []).map((item) => item.title), ...(resources.data ?? []).map((item) => item.title)])].filter(Boolean)}
          onClose={() => {
            setShowForm(false)
            setEditing(null)
            setDraftTitle('')
            setAppendEssayEntry(false)
            setEssayExtraIds([])
          }}
          onSave={saveResource}
        />
      ) : null}
      {selectedEvent ? (
        <ScheduleModal
          event={selectedEvent}
          onClose={closeScheduleDialog}
          onSave={updateSchedule}
          onDelete={(item) => setPendingDelete({ kind: 'schedule', id: item.id, title: item.title })}
        />
      ) : selectedDay ? (
        <ScheduleModal
          date={selectedDay}
          onClose={closeScheduleDialog}
          onSave={addSchedule}
        />
      ) : null}
      {pendingDelete ? (
        <ConfirmDialog
          title={pendingDelete.kind === 'resource' ? '자료 삭제' : '일정 삭제'}
          message={`"${pendingDelete.title}"을(를) 삭제할까요? 이 작업은 되돌릴 수 없습니다.`}
          onClose={() => setPendingDelete(null)}
          onConfirm={() => void confirmDelete()}
        />
      ) : null}
    </div>
  )
}

function InlineError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Archive size={22} />
      </div>
      <h2>자료를 불러오지 못했어요</h2>
      <p>{message}</p>
      <button className="primary-button" onClick={onRetry}>
        다시 시도
      </button>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="empty-state">
      <div className="loading-spinner" aria-label="자료 불러오는 중" />
      <p>서버에서 자료를 불러오는 중입니다.</p>
    </div>
  )
}

function EmptyState({
  onAdd,
  title,
  description,
  actionLabel,
}: {
  onAdd: () => void
  title: string
  description: string
  actionLabel: string
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Archive size={22} />
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
      <button className="primary-button" onClick={onAdd}>
        <Plus size={16} /> {actionLabel}
      </button>
    </div>
  )
}
