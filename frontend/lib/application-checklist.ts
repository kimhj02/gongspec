export type ChecklistItem = { id: string; title: string; completed: boolean }

export function parseChecklist(value?: string): ChecklistItem[] {
  if (!value) return []
  try {
    const parsed: unknown = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    const ids = new Set<string>()
    return parsed.filter((item): item is ChecklistItem => {
      if (!item || typeof item.id !== 'string' || !item.id ||
        typeof item.title !== 'string' || !item.title.trim() ||
        typeof item.completed !== 'boolean' || ids.has(item.id)) return false
      ids.add(item.id)
      return true
    })
  } catch {
    return []
  }
}

export function serializeChecklist(items: ChecklistItem[]) {
  return JSON.stringify(items.map((item) => ({ ...item, title: item.title.trim() })).filter((item) => item.title))
}
