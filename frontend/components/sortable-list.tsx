'use client'

import { Fragment, useRef, useState, type DragEvent, type KeyboardEvent, type ReactNode } from 'react'
import { GripVertical } from 'lucide-react'
import { moveItem } from '@/lib/reorder'

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
    onReorder(moveItem(items, from, to))
  }

  const moveByKey = (id: string, offset: number) => {
    const from = items.findIndex((item) => getId(item) === id)
    if (from < 0) return
    onReorder(moveItem(items, from, from + offset))
  }

  return (
    <div className={className}>
      {items.map((item) => {
        const id = getId(item)
        const bind: SortableBind = {
          className: `sortable-item${draggingId === id ? ' is-dragging' : ''}${overId === id && draggingId !== id ? ' is-over' : ''}${disabled ? '' : ' is-sortable'}`,
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
          handle: disabled
            ? null
            : {
                className: 'sortable-handle',
                draggable: true,
                tabIndex: 0,
                'aria-label': '끌어 순서를 바꿉니다. 위아래 화살표로도 이동합니다.',
                onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
                  if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
                  event.preventDefault()
                  moveByKey(id, event.key === 'ArrowUp' ? -1 : 1)
                },
                onDragStart: (event: DragEvent<HTMLElement>) => {
                  event.dataTransfer.effectAllowed = 'move'
                  event.dataTransfer.setData('text/plain', id)
                  const card = event.currentTarget.closest('.sortable-item')
                  if (card instanceof HTMLElement && typeof event.dataTransfer.setDragImage === 'function') {
                    event.dataTransfer.setDragImage(card, 24, 24)
                  }
                  draggingIdRef.current = id
                  setDraggingId(id)
                },
                onDragEnd: () => {
                  draggingIdRef.current = null
                  setDraggingId(null)
                  setOverId(null)
                },
              },
        }
        return <Fragment key={id}>{renderItem(item, bind)}</Fragment>
      })}
    </div>
  )
}

export function SortableHandle({ bind }: { bind: SortableHandleBind | null }) {
  if (!bind) return null
  return (
    <span {...bind}>
      <GripVertical size={15} aria-hidden />
    </span>
  )
}

export type SortableHandleBind = {
  className: string
  draggable: boolean
  tabIndex: number
  'aria-label': string
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void
  onDragStart: (event: DragEvent<HTMLElement>) => void
  onDragEnd: () => void
}

export type SortableBind = {
  className: string
  onDragOver: (event: DragEvent<HTMLElement>) => void
  onDrop: (event: DragEvent<HTMLElement>) => void
  onDragEnd: () => void
  handle: SortableHandleBind | null
}
