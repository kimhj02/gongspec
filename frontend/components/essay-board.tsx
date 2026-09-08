'use client'

import { Pencil, Pin, PinOff, Plus, Trash2 } from 'lucide-react'
import type { Resource } from '@/lib/api'
import { groupEssaysByPosting, mergeEssayResources, parseEssayEntries } from '@/lib/resource-fields'

export default function EssayBoard({
  items,
  onAddItem,
  onEdit,
  onDelete,
  onTogglePin,
}: {
  items: Resource[]
  onAddItem: (posting: Resource) => void
  onEdit: (item: Resource) => void
  onDelete: (items: Resource[]) => void
  onTogglePin: (item: Resource) => void
}) {
  const groups = groupEssaysByPosting(items)

  return (
    <div className="essay-board">
      {groups.map(([postingName, essays]) => {
        const posting = mergeEssayResources(essays)
        const entries = parseEssayEntries(posting)
        return (
          <article className={`essay-posting ${posting.pinned ? 'is-pinned' : ''}`} key={postingName}>
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
                <button onClick={() => onDelete(essays)} aria-label="삭제">
                  <Trash2 size={15} />
                </button>
                <button className="secondary-button" onClick={() => onAddItem(posting)}>
                  <Plus size={15} /> 항목 추가
                </button>
              </div>
            </div>
            <div className="essay-entry-cards">
              {entries.length ? (
                entries.map((entry, index) => (
                  <section className="essay-entry-card" key={`${entry.item}-${index}`}>
                    <h3>
                      {entry.item || `항목 ${index + 1}`}
                      <span className="char-count">공백 포함 {entry.essay.length}자 · 공백 제외 {entry.essay.replace(/\s/g, '').length}자</span>
                    </h3>
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
