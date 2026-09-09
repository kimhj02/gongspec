'use client'

import { ChevronDown, Pencil, Pin, PinOff, Trash2 } from 'lucide-react'
import type { Resource } from '@/lib/api'
import { characterCountLabel, filledDetails } from '@/lib/resource-fields'
import { tabLabel } from '@/lib/tabs'

export default function ResourceCard({
  item,
  collapsed,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleCollapsed,
  onWriteEssay,
  onOpenEssay,
}: {
  item: Resource
  collapsed: boolean
  onEdit: () => void
  onDelete: () => void
  onTogglePin: () => void
  onToggleCollapsed: () => void
  onWriteEssay?: () => void
  onOpenEssay?: () => void
}) {
  const details = filledDetails(item)
  const bodyIsDuplicated = Boolean(item.body && details.some((row) => row.value === item.body))

  return (
    <article className={`resource-card ${item.pinned ? 'is-pinned' : ''}`}>
      <div className="card-topline">
        <span className="card-category">{tabLabel(item.tab)}</span>
        <div className="card-actions">
          <button onClick={onTogglePin} aria-label={item.pinned ? '고정 해제' : '고정'}>
            {item.pinned ? <Pin size={15} /> : <PinOff size={15} />}
          </button>
          <button onClick={onEdit} aria-label="수정">
            <Pencil size={15} />
          </button>
          <button onClick={onDelete} aria-label="삭제">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      <button className="card-title-row" onClick={onToggleCollapsed}>
        <div>
          <h2>{item.title}</h2>
          {item.subtitle && <p>{item.subtitle}</p>}
        </div>
        <ChevronDown className={collapsed ? 'rotate' : ''} size={17} />
      </button>
      {!collapsed && (
        <>
          {item.body && !bodyIsDuplicated ? <p className="card-body">{item.body}</p> : null}
          {details.length ? (
            <dl className="card-details">
              {details.map((row) => (
                <div key={row.label} className={row.countChars ? 'has-char-count' : undefined}>
                  <dt>
                    {row.label}
                    {row.countChars ? <span className="char-count">{characterCountLabel(row.value)}</span> : null}
                  </dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {!item.body && !details.length ? <p className="card-body">상세 기록이 없습니다.</p> : null}
          <div className="card-footer">
            <div className="tag-list">
              {item.tags?.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            {item.date && <time>{item.date}</time>}
          </div>
        </>
      )}
      {onWriteEssay || onOpenEssay ? (
        <div className="card-links">
          {onWriteEssay ? (
            <button type="button" className="secondary-button" onClick={onWriteEssay}>
              자기소개서 작성
            </button>
          ) : null}
          {onOpenEssay ? (
            <button type="button" className="secondary-button" onClick={onOpenEssay}>
              자기소개서 바로가기
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
