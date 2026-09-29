'use client'

import { Plus, Trash2 } from 'lucide-react'
import type { ChecklistItem } from '@/lib/application-checklist'

export default function ApplicationChecklist({ items, onChange, disabled }: {
  items: ChecklistItem[]
  onChange: (items: ChecklistItem[]) => void
  disabled: boolean
}) {
  const filled = items.filter((item) => item.title.trim())
  return (
    <fieldset className="application-checklist" disabled={disabled}>
      <legend>준비 체크리스트</legend>
      <p className="checklist-summary" aria-live="polite">{filled.filter((item) => item.completed).length}/{filled.length} 완료</p>
      {items.length ? (
        <ul className="checklist-items">
          {items.map((item, index) => (
            <li key={item.id} className={item.completed ? 'is-completed' : undefined}>
              <input
                type="checkbox"
                checked={item.completed}
                aria-label={`${item.title.trim() || `항목 ${index + 1}`} 완료`}
                onChange={(event) => onChange(items.map((row) => row.id === item.id ? { ...row, completed: event.target.checked } : row))}
              />
              <input
                type="text"
                aria-label={`체크리스트 항목 ${index + 1}`}
                placeholder="예: 자기소개서 최종 검토"
                value={item.title}
                maxLength={200}
                onChange={(event) => onChange(items.map((row) => row.id === item.id ? { ...row, title: event.target.value } : row))}
              />
              <button
                type="button"
                className="icon-button"
                aria-label={`${item.title.trim() || `항목 ${index + 1}`} 삭제`}
                onClick={() => onChange(items.filter((row) => row.id !== item.id))}
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      ) : <p className="checklist-hint">지원 준비에 필요한 항목을 추가해 보세요.</p>}
      <button
        type="button"
        className="secondary-button checklist-add"
        onClick={() => onChange([...items, { id: crypto.randomUUID(), title: '', completed: false }])}
      >
        <Plus size={15} /> 항목 추가
      </button>
      <p className="checklist-hint">지원 현황을 추가하거나 수정하면 함께 저장됩니다. 빈 항목은 저장하지 않습니다.</p>
    </fieldset>
  )
}
