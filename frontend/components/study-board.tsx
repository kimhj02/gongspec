'use client'

import { FormEvent, useMemo, useState } from 'react'
import useSWR from 'swr'
import { Plus, Search, X } from 'lucide-react'
import ConfirmDialog from '@/components/confirm-dialog'
import ModalShell from '@/components/modal-shell'
import type { Notice } from '@/components/app-notice'
import {
  api,
  getApiError,
  studyCommentsKey,
  studyKey,
  type StudyMode,
  type StudyPost,
  type StudyPostDraft,
  type StudyPurpose,
} from '@/lib/api'
import { tabCopy } from '@/lib/tabs'

export const studyPurposes: StudyPurpose[] = ['NCS', '면접', '기타']
export const studyModes: StudyMode[] = ['온라인', '오프라인', '혼합']

type StudyBoardProps = {
  onNotice: (notice: Notice) => void
}

export default function StudyBoard({ onNotice }: StudyBoardProps) {
  const [query, setQuery] = useState('')
  const [purpose, setPurpose] = useState<StudyPurpose | ''>('')
  const [selected, setSelected] = useState<StudyPost | null>(null)
  const [editing, setEditing] = useState<StudyPost | null | 'new'>(null)
  const [pendingDelete, setPendingDelete] = useState<{ kind: 'post' | 'comment'; id: string; title: string } | null>(null)
  const [report, setReport] = useState<{ kind: 'post' | 'comment'; id: string } | null>(null)

  const posts = useSWR(studyKey(query, purpose), ([, nextQuery, nextPurpose]) => api.study.list({ query: nextQuery, purpose: nextPurpose }), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  })
  const comments = useSWR(selected ? studyCommentsKey(selected.id) : null, ([, id]) => api.study.comments(id), {
    revalidateOnFocus: false,
  })

  const items = posts.data ?? []

  const openCreate = () => setEditing('new')
  const closeEditor = () => setEditing(null)

  const savePost = async (draft: StudyPostDraft, id?: string) => {
    const saved = id ? await api.study.update(id, draft) : await api.study.create(draft)
    await posts.mutate()
    setSelected(saved)
    closeEditor()
    onNotice({ type: 'success', message: id ? '모집글을 고쳤습니다.' : '모집글을 올렸습니다.' })
  }

  const toggleStatus = async (post: StudyPost) => {
    try {
      const saved = post.status === '모집 중' ? await api.study.close(post.id) : await api.study.open(post.id)
      await posts.mutate()
      setSelected(saved)
      onNotice({ type: 'success', message: saved.status === '마감' ? '모집을 마감했습니다.' : '다시 모집합니다.' })
    } catch (error) {
      onNotice({ type: 'error', message: getApiError(error) })
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    try {
      if (pendingDelete.kind === 'post') {
        await api.study.remove(pendingDelete.id)
        if (selected?.id === pendingDelete.id) setSelected(null)
      } else {
        await api.study.removeComment(pendingDelete.id)
        await comments.mutate()
      }
      await posts.mutate()
      onNotice({ type: 'success', message: `${pendingDelete.title}을(를) 삭제했습니다.` })
    } catch (error) {
      onNotice({ type: 'error', message: getApiError(error) })
    } finally {
      setPendingDelete(null)
    }
  }

  return (
    <>
      <div className="toolbar">
        <div className="search-field">
          <Search size={17} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="기관·제목 검색하기" aria-label="스터디 검색" />
          {query ? (
            <button onClick={() => setQuery('')} aria-label="검색어 지우기">
              <X size={15} />
            </button>
          ) : null}
        </div>
        <div className="hire-filters" role="group" aria-label="스터디 목적">
          {(['', ...studyPurposes] as const).map((option) => {
            const active = purpose === option
            const label = option || '전체'
            return (
              <button
                key={label}
                type="button"
                className={active ? 'active' : undefined}
                aria-pressed={active}
                onClick={() => setPurpose(active && option ? '' : option)}
              >
                {label}
              </button>
            )
          })}
        </div>
        <div className="view-caption">
          <span>
            {items.length}개의 {tabCopy.study.countLabel}
          </span>
        </div>
        <button className="primary-button" onClick={openCreate}>
          <Plus size={17} /> {tabCopy.study.createLabel}
        </button>
      </div>
      {posts.error ? (
        <div className="empty-state">
          <h2>모집글을 불러오지 못했어요</h2>
          <p>{getApiError(posts.error)}</p>
          <button className="primary-button" onClick={() => void posts.mutate()}>
            다시 시도
          </button>
        </div>
      ) : posts.isLoading && !posts.data ? (
        <div className="empty-state">
          <div className="loading-spinner" aria-label="자료 불러오는 중" />
          <p>서버에서 자료를 불러오는 중입니다.</p>
        </div>
      ) : items.length ? (
        <div className="study-list">
          {items.map((item) => (
            <article key={item.id} className={`study-card${item.status === '마감' ? ' is-closed' : ''}`}>
              <button type="button" className="study-card-main" onClick={() => setSelected(item)}>
                <div className="study-card-topline">
                  <b className="study-pill">{item.status}</b>
                  <b className="study-pill">{item.purpose}</b>
                  <b className="study-pill">{item.mode}</b>
                </div>
                <h2>{item.title}</h2>
                <p>
                  {[item.institution, item.region, item.capacity ? `${item.capacity}명` : ''].filter(Boolean).join(' · ')}
                </p>
                <span>
                  {item.authorNickname || '닉네임 없음'} · 댓글 {item.commentCount}
                </span>
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>{tabCopy.study.emptyTitle}</h2>
          <p>{tabCopy.study.emptyDescription}</p>
          <button className="primary-button" onClick={openCreate}>
            <Plus size={16} /> {tabCopy.study.createLabel}
          </button>
        </div>
      )}

      {selected ? (
        <StudyDetail
          post={selected}
          comments={comments.data ?? []}
          commentsLoading={Boolean(comments.isLoading && !comments.data)}
          commentsError={comments.error ? getApiError(comments.error) : ''}
          onClose={() => setSelected(null)}
          onEdit={() => setEditing(selected)}
          onToggleStatus={() => void toggleStatus(selected)}
          onDelete={() => setPendingDelete({ kind: 'post', id: selected.id, title: selected.title })}
          onReport={() => setReport({ kind: 'post', id: selected.id })}
          onComment={async (body) => {
            await api.study.addComment(selected.id, body)
            await Promise.all([comments.mutate(), posts.mutate()])
          }}
          onDeleteComment={(comment) => setPendingDelete({ kind: 'comment', id: comment.id, title: '댓글' })}
          onReportComment={(id) => setReport({ kind: 'comment', id })}
          onRetryComments={() => void comments.mutate()}
        />
      ) : null}
      {editing ? (
        <StudyForm
          initial={editing === 'new' ? null : editing}
          onClose={closeEditor}
          onSave={(draft) => savePost(draft, editing === 'new' ? undefined : editing.id)}
          onNotice={onNotice}
        />
      ) : null}
      {report ? (
        <ReportDialog
          onClose={() => setReport(null)}
          onSubmit={async (reason) => {
            if (report.kind === 'post') await api.study.reportPost(report.id, reason)
            else await api.study.reportComment(report.id, reason)
            setReport(null)
            onNotice({ type: 'success', message: '신고했습니다.' })
          }}
        />
      ) : null}
      {pendingDelete ? (
        <ConfirmDialog
          title={pendingDelete.kind === 'post' ? '모집글 삭제' : '댓글 삭제'}
          message={`"${pendingDelete.title}"을(를) 삭제할까요? 이 작업은 되돌릴 수 없습니다.`}
          onClose={() => setPendingDelete(null)}
          onConfirm={() => void confirmDelete()}
        />
      ) : null}
    </>
  )
}

function StudyDetail({
  post,
  comments,
  commentsLoading,
  commentsError,
  onClose,
  onEdit,
  onToggleStatus,
  onDelete,
  onReport,
  onComment,
  onDeleteComment,
  onReportComment,
  onRetryComments,
}: {
  post: StudyPost
  comments: { id: string; body: string; authorNickname: string; mine: boolean }[]
  commentsLoading: boolean
  commentsError: string
  onClose: () => void
  onEdit: () => void
  onToggleStatus: () => void
  onDelete: () => void
  onReport: () => void
  onComment: (body: string) => Promise<void>
  onDeleteComment: (comment: { id: string; body: string; authorNickname: string; mine: boolean }) => void
  onReportComment: (id: string) => void
  onRetryComments: () => void
}) {
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onComment(body.trim())
      setBody('')
    } catch (caught) {
      setError(getApiError(caught))
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalShell onClose={onClose} labelledBy="study-detail-title" className="resource-form-card">
      <div className="modal-header">
        <div className="page-intro-copy">
          <div className="eyebrow">{post.status}</div>
          <h2 id="study-detail-title">{post.title}</h2>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="닫기">
          <X size={18} />
        </button>
      </div>
      <p className="study-detail-meta">
        {[post.institution, post.purpose, post.mode, post.region, post.capacity ? `${post.capacity}명` : ''].filter(Boolean).join(' · ')}
      </p>
      <p className="study-detail-author">{post.authorNickname || '닉네임 없음'}</p>
      {post.recruitTitle ? <p className="study-detail-recruit">연결 공고: {post.recruitTitle}</p> : null}
      {post.scheduleText ? <p className="study-detail-schedule">희망 일정: {post.scheduleText}</p> : null}
      {post.body ? <p className="study-detail-body">{post.body}</p> : null}
      <div className="form-actions">
        {post.mine ? (
          <>
            <button type="button" className="secondary-button" onClick={onEdit}>
              수정
            </button>
            <button type="button" className="secondary-button" onClick={onToggleStatus}>
              {post.status === '모집 중' ? '마감' : '다시 모집'}
            </button>
            <button type="button" className="secondary-button danger-button" onClick={onDelete}>
              삭제
            </button>
          </>
        ) : (
          <button type="button" className="secondary-button" onClick={onReport}>
            신고
          </button>
        )}
      </div>
      <section className="study-comments">
        <h3>댓글 {comments.length}</h3>
        {commentsError ? (
          <p className="form-error">
            {commentsError}{' '}
            <button type="button" className="secondary-button" onClick={onRetryComments}>
              다시 시도
            </button>
          </p>
        ) : commentsLoading ? (
          <p>댓글을 불러오는 중...</p>
        ) : comments.length ? (
          comments.map((comment) => (
            <div key={comment.id} className="study-comment">
              <strong>{comment.authorNickname || '닉네임 없음'}</strong>
              <p>{comment.body}</p>
              <div className="study-comment-actions">
                {comment.mine ? (
                  <button type="button" onClick={() => onDeleteComment(comment)}>
                    삭제
                  </button>
                ) : (
                  <button type="button" onClick={() => onReportComment(comment.id)}>
                    신고
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>아직 댓글이 없습니다. 사이트 안에서만 이야기해 주세요.</p>
        )}
        <form className="study-comment-form" onSubmit={(event) => void submit(event)}>
          <label>
            댓글
            <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={3} required maxLength={1000} placeholder="전화번호·오픈채팅은 적을 수 없습니다." />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="primary-button" disabled={saving || !body.trim()}>
            {saving ? '등록 중...' : '댓글 쓰기'}
          </button>
        </form>
      </section>
    </ModalShell>
  )
}

function StudyForm({
  initial,
  onClose,
  onSave,
  onNotice,
}: {
  initial: StudyPost | null
  onClose: () => void
  onSave: (draft: StudyPostDraft) => Promise<void>
  onNotice: (notice: Notice) => void
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [institution, setInstitution] = useState(initial?.institution ?? '')
  const [purpose, setPurpose] = useState<StudyPurpose>(initial?.purpose ?? 'NCS')
  const [mode, setMode] = useState<StudyMode>(initial?.mode ?? '온라인')
  const [region, setRegion] = useState(initial?.region ?? '')
  const [capacity, setCapacity] = useState(initial?.capacity ? String(initial.capacity) : '')
  const [scheduleText, setScheduleText] = useState(initial?.scheduleText ?? '')
  const [body, setBody] = useState(initial?.body ?? '')
  const [recruitQuery, setRecruitQuery] = useState(initial?.recruitTitle ?? '')
  const [recruitId, setRecruitId] = useState(initial?.recruitId ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const recruits = useSWR(recruitQuery.trim().length >= 2 ? ['study-recruit-search', recruitQuery] : null, ([, next]) => api.recruits.list({ query: next }), {
    revalidateOnFocus: false,
  })
  const matches = useMemo(() => recruits.data ?? [], [recruits.data])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSave({
        title: title.trim(),
        institution: institution.trim(),
        recruitId: recruitId || null,
        purpose,
        mode,
        region: region.trim(),
        capacity: capacity ? Number(capacity) : null,
        scheduleText: scheduleText.trim(),
        body: body.trim(),
      })
    } catch (caught) {
      setError(getApiError(caught))
      onNotice({ type: 'error', message: getApiError(caught) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalShell onClose={onClose} labelledBy="study-form-title" className="resource-form-card">
      <form onSubmit={(event) => void submit(event)}>
        <div className="modal-header">
          <div className="page-intro-copy">
            <div className="eyebrow">STUDY</div>
            <h2 id="study-form-title">{initial ? tabCopy.study.editLabel : tabCopy.study.createLabel}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </div>
        <div className="detail-form-grid">
          <label>
            제목
            <input value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={120} />
          </label>
          <label>
            기관명 (선택)
            <input value={institution} onChange={(event) => setInstitution(event.target.value)} maxLength={120} placeholder="예: 한국전력공사" />
          </label>
          <label>
            목적
            <select value={purpose} onChange={(event) => setPurpose(event.target.value as StudyPurpose)}>
              {studyPurposes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            진행
            <select value={mode} onChange={(event) => setMode(event.target.value as StudyMode)}>
              {studyModes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            지역
            <input value={region} onChange={(event) => setRegion(event.target.value)} maxLength={80} placeholder="오프라인·혼합일 때" />
          </label>
          <label>
            모집 인원
            <input type="number" min={1} max={99} value={capacity} onChange={(event) => setCapacity(event.target.value)} />
          </label>
          <label>
            희망 일정
            <input value={scheduleText} onChange={(event) => setScheduleText(event.target.value)} maxLength={200} placeholder="예: 주 2회 저녁" />
          </label>
          <label>
            공고 연결 (선택)
            <input
              value={recruitQuery}
              onChange={(event) => {
                setRecruitQuery(event.target.value)
                setRecruitId('')
              }}
              placeholder="공고명·기관명으로 찾기"
            />
          </label>
        </div>
        {matches.length ? (
          <ul className="study-recruit-matches">
            {matches.slice(0, 6).map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    setRecruitId(item.id)
                    setInstitution(item.instNm)
                    setRecruitQuery(`${item.instNm} ${item.title}`)
                  }}
                >
                  {item.instNm} · {item.title}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <label>
          소개
          <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={5} maxLength={4000} placeholder="전화번호나 오픈채팅 주소는 적을 수 없습니다." />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <div className="form-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            취소
          </button>
          <button className="primary-button" disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

function ReportDialog({ onClose, onSubmit }: { onClose: () => void; onSubmit: (reason: string) => Promise<void> }) {
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSubmit(reason.trim())
    } catch (caught) {
      setError(getApiError(caught))
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalShell elevated onClose={onClose} labelledBy="study-report-title" className="small-modal">
      <form onSubmit={(event) => void submit(event)}>
        <div className="modal-header">
          <div className="page-intro-copy">
            <div className="eyebrow">REPORT</div>
            <h2 id="study-report-title">신고하기</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </div>
        <label>
          사유
          <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={4} required maxLength={300} />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <div className="modal-footer">
          <button type="button" className="secondary-button" onClick={onClose}>
            취소
          </button>
          <button className="primary-button" disabled={saving || !reason.trim()}>
            {saving ? '보내는 중...' : '신고'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}
