'use client'

import { ChevronDown, Search, Tag } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export default function ComboField({
  label,
  value,
  options,
  placeholder,
  required = false,
  allowCustom = false,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  placeholder?: string
  autoFocus?: boolean
  required?: boolean
  allowCustom?: boolean
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const labelId = useId()
  const listId = useId()
  const typed = query.trim()
  const filtered = allowCustom && typed ? options.filter((option) => option.includes(typed)) : options
  const custom = allowCustom && typed && !options.includes(typed) ? typed : ''

  const openMenu = () => {
    const box = triggerRef.current?.getBoundingClientRect()
    if (box) setCoords({ top: box.bottom + 6, left: box.left, width: box.width })
    setQuery('')
    setOpen(true)
    if (allowCustom) requestAnimationFrame(() => searchRef.current?.focus())
  }

  const pick = (next: string) => {
    onChange(next)
    setOpen(false)
    setQuery('')
  }

  useEffect(() => {
    const close = (event: MouseEvent) => {
      const target = event.target as Node
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  useEffect(() => {
    if (!open) return
    const place = () => {
      const box = triggerRef.current?.getBoundingClientRect()
      if (!box) return
      setCoords({ top: box.bottom + 6, left: box.left, width: box.width })
    }
    place()
    window.addEventListener('resize', place)
    document.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      document.removeEventListener('scroll', place, true)
    }
  }, [open])

  return (
    <div className={`combo-field ${open ? 'is-open' : ''}`} ref={rootRef}>
      <span id={labelId}>{label}</span>
      <button
        ref={triggerRef}
        type="button"
        className={`combo-trigger ${value ? '' : 'is-empty'}`}
        aria-labelledby={labelId}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        onClick={() => (open ? setOpen(false) : openMenu())}
      >
        <Tag size={15} className="combo-trigger-icon" />
        <b>{value || placeholder}</b>
        <ChevronDown size={16} />
      </button>
      {required ? <input className="combo-required" tabIndex={-1} value={value} required readOnly aria-hidden /> : null}
      {open && coords
        ? createPortal(
            <div ref={panelRef} className="combo-panel" style={{ top: coords.top, left: coords.left, width: coords.width }}>
              {allowCustom ? (
                <div className="combo-search">
                  <Search size={15} />
                  <input
                    ref={searchRef}
                    value={query}
                    placeholder="검색하거나 직접 입력"
                    aria-label={`${label} 검색`}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') setOpen(false)
                      if (event.key !== 'Enter') return
                      event.preventDefault()
                      if (filtered.length === 1) pick(filtered[0])
                      else if (custom) pick(custom)
                      else if (filtered.includes(typed)) pick(typed)
                    }}
                  />
                </div>
              ) : null}
              <ul id={listId} className="combo-menu" role="listbox" aria-labelledby={labelId}>
                {filtered.map((option) => {
                  const active = value === option
                  return (
                    <li key={option}>
                      <button type="button" role="option" aria-selected={active} className={active ? 'active' : undefined} onClick={() => pick(option)}>
                        <span className={`combo-check ${active ? 'is-on' : ''}`} aria-hidden />
                        {option}
                      </button>
                    </li>
                  )
                })}
                {custom ? (
                  <li>
                    <button type="button" role="option" aria-selected={value === custom} onClick={() => pick(custom)}>
                      <span className="combo-check" aria-hidden />
                      {custom} 직접 입력
                    </button>
                  </li>
                ) : null}
                {!filtered.length && !custom ? <li className="combo-empty">해당하는 항목이 없어요</li> : null}
              </ul>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
