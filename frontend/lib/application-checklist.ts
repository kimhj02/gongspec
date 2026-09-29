/** details.checklist에 저장한 JSON을 화면용 항목으로 읽고, 저장 시 공백과 빈 항목을 정리한다. */
export type ChecklistItem = { id: string; title: string; completed: boolean }

/** 이전 자료의 누락·손상된 JSON은 빈 목록으로 처리하고 잘못된 항목과 중복 ID를 제외한다. */
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
