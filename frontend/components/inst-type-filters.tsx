'use client'

import type { InstTypeFilter } from '@/lib/api'

export const instTypeFilterOptions: { value: InstTypeFilter | ''; label: string }[] = [
  { value: '', label: '전체' },
  { value: '공기업', label: '공기업' },
  { value: '준정부', label: '준정부' },
  { value: '기타', label: '기타' },
]

export default function InstTypeFilters({
  value,
  onChange,
}: {
  value: InstTypeFilter | ''
  onChange: (value: InstTypeFilter | '') => void
}) {
  return (
    <div className="hire-filters" role="group" aria-label="기관유형">
      {instTypeFilterOptions.map((option) => {
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
