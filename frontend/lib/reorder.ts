export function moveItem<T>(items: T[], from: number, to: number) {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return items
  const next = [...items]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

export function moveById<T extends { id: string }>(items: T[], fromId: string, toId: string) {
  return moveItem(
    items,
    items.findIndex((item) => item.id === fromId),
    items.findIndex((item) => item.id === toId),
  )
}
