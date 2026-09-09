'use client'

import { useEffect } from 'react'
import { Pencil, Pin, PinOff, Trash2 } from 'lucide-react'
import type { Resource } from '@/lib/api'
import { characterCountLabel, groupEssaysByPosting, mergeEssayResources, parseEssayEntries } from '@/lib/resource-fields'

export default function EssayBoard({
  items,
  focusTitle,
  onEdit,
  onDelete,
  onDeleteEntry,
  onTogglePin,
}: {
  items: Resource[]
  focusTitle?: string
  onEdit: (item: Resource) => void
  onDelete: (items: Resource[]) => void
  onDeleteEntry: (posting: Resource, index: number) => void
  onTogglePin: (item: Resource) => void
}) {
  const groups = groupEssaysByPosting(items)

  useEffect(() => {
    if (!focusTitle) return
    const node = document.querySelector(`[data-posting="${CSS.escape(focusTitle)}"]`)
    if (node && typeof node.scrollIntoView === 'function') {
      node.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [focusTitle, items])

  return (
    <div className="essay-board">
      {groups.map(([postingName, essays]) => {
        const posting = mergeEssayResources(essays)
        const entries = parseEssayEntries(posting)
        const focused = Boolean(focusTitle && postingName === focusTitle)
        return (
          <article
            className={`essay-posting ${posting.pinned ? 'is-pinned' : ''} ${focused ? 'is-focused' : ''}`}
            data-posting={postingName}
            key={postingName}
          >
            <div className="essay-group-header">
              <div className="page-intro-copy">
                <div className="eyebrow">POSTING</div>
                <h2>{postingName}</h2>
                <p>{entries.length}개의 자기소개서 항목</p>
              </div>
              <div className="card-actions">
                <button onClick={() => onTogglePin(posting)} aria-label={posting.pinned ? '고정 해제' : '고정'}>
                  {posting.pinned ? <Pin size={15} /> : <PinOff size={15} />}
                </button>
                <button onClick={() => onEdit(posting)} aria-label="수정">
                  <Pencil size={15} />
                </button>
                <button onClick={() => onDelete(essays)} aria-label="공고 삭제">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            <div className="essay-entry-cards">
              {entries.length ? (
                entries.map((entry, index) => (
                  <section className="essay-entry-card" key={`${entry.item}-${index}`}>
                    <div className="essay-entry-card-head">
                      <h3>
                        {entry.item || `항목 ${index + 1}`}
                        <span className="char-count">{characterCountLabel(entry.essay)}</span>
                      </h3>
                      <button type="button" className="icon-button" onClick={() => onDeleteEntry(posting, index)} aria-label="항목 삭제">
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <p>{entry.essay || '내용을 아직 작성하지 않았습니다.'}</p>
                  </section>
                ))
              ) : (
                <p className="dday-empty">아직 작성된 항목이 없습니다.</p>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}
