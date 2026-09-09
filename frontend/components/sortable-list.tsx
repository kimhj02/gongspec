'use client'

import { Fragment, useRef, useState, type DragEvent, type ReactNode } from 'react'

export default function SortableList<T>({
  items,
  getId,
  disabled,
  className,
  onReorder,
  renderItem,
}: {
  items: T[]
  getId: (item: T) => string
  disabled?: boolean
  className?: string
  onReorder: (items: T[]) => void
  renderItem: (item: T, bind: SortableBind) => ReactNode
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const draggingIdRef = useRef<string | null>(null)

  const move = (fromId: string, toId: string) => {
    if (fromId === toId) return
    const from = items.findIndex((item) => getId(item) === fromId)
    const to = items.findIndex((item) => getId(item) === toId)
    if (from < 0 || to < 0) return
    const next = [...items]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onReorder(next)
  }

  return (
    <div className={className}>
      {items.map((item) => {
        const id = getId(item)
        const bind: SortableBind = {
          className: `sortable-item${draggingId === id ? ' is-dragging' : ''}${overId === id && draggingId !== id ? ' is-over' : ''}${disabled ? '' : ' is-sortable'}`,
          draggable: !disabled,
          onDragStart: (event: DragEvent<HTMLElement>) => {
            const target = event.target as HTMLElement
            if (disabled || target.closest('button, a, input, textarea, select, label')) {
              event.preventDefault()
              return
            }
            event.dataTransfer.effectAllowed = 'move'
            event.dataTransfer.setData('text/plain', id)
            draggingIdRef.current = id
            setDraggingId(id)
          },
          onDragOver: (event: DragEvent<HTMLElement>) => {
            const fromId = draggingIdRef.current
            if (disabled || !fromId || fromId === id) return
            event.preventDefault()
            event.dataTransfer.dropEffect = 'move'
            setOverId(id)
          },
          onDrop: (event: DragEvent<HTMLElement>) => {
            event.preventDefault()
            const fromId = event.dataTransfer.getData('text/plain') || draggingIdRef.current
            if (fromId) move(fromId, id)
            draggingIdRef.current = null
            setDraggingId(null)
            setOverId(null)
          },
          onDragEnd: () => {
            draggingIdRef.current = null
            setDraggingId(null)
            setOverId(null)
          },
        }
        return <Fragment key={id}>{renderItem(item, bind)}</Fragment>
      })}
    </div>
  )
}

export type SortableBind = {
  className: string
  draggable: boolean
  onDragStart: (event: DragEvent<HTMLElement>) => void
  onDragOver: (event: DragEvent<HTMLElement>) => void
  onDrop: (event: DragEvent<HTMLElement>) => void
  onDragEnd: () => void
}
