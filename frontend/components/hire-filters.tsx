'use client'

import type { HireTypeFilter } from '@/lib/api'

export const hireFilterOptions: { value: HireTypeFilter | ''; label: string }[] = [
  { value: '', label: '전체' },
  { value: '정규직', label: '정규직' },
  { value: '계약직', label: '계약직' },
  { value: '인턴', label: '인턴' },
]

export default function HireFilters({
  value,
  onChange,
}: {
  value: HireTypeFilter | ''
  onChange: (value: HireTypeFilter | '') => void
}) {
  return (
    <div className="hire-filters" role="group" aria-label="고용형태">
      {hireFilterOptions.map((option) => {
        const active = value === option.value
        return (
          <button
            key={option.label}
            type="button"
            className={active ? 'active' : undefined}
            aria-pressed={active}
            onClick={() => onChange(active && option.value ? '' : option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
