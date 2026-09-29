import { describe, expect, it } from 'vitest'
import { parseChecklist, serializeChecklist } from './application-checklist'
import { overlayApplication, toApplicationPayload } from './resource-fields'
import type { Resource } from './api'

describe('checklist persistence', () => {
  const first = { id: '1', title: '자소서 작성', completed: true }
  const second = { id: '2', title: '지원서 제출', completed: false }
  const details = { institution: '한국전력공사', posting: '사무직 공채', checklist: serializeChecklist([first]) }

  it('handles old or malformed data without breaking the form', () => {
    for (const raw of [undefined, '', 'invalid', 'null', '{}']) expect(parseChecklist(raw)).toEqual([])
    expect(parseChecklist(JSON.stringify([null, {}, first, first, { ...second, completed: 'false' }]))).toEqual([first])
  })

  it('preserves existing items when editing stages without a checklist change', () => {
    const result = toApplicationPayload({ institution: '한국전력공사', posting: '사무직 공채', writtenAt: '2026-10-15' }, 'written', details)
    expect(parseChecklist(result.details?.checklist)).toEqual([first])
  })

  it('merges new items into an existing application without duplicating or losing items', () => {
    const existing: Resource = { id: 'app', tab: 'applications', title: details.posting, details }
    const incoming = toApplicationPayload({ ...details, checklist: serializeChecklist([first, second]), writtenAt: '2026-10-15' }, 'written')
    expect(parseChecklist(overlayApplication(existing, incoming).details?.checklist)).toEqual([first, second])
    expect(parseChecklist(overlayApplication(existing, toApplicationPayload({ ...details, checklist: '[]' }, 'document')).details?.checklist)).toEqual([first])
  })

  it('preserves stage dates when adding only a checklist to a duplicate application', () => {
    const existing: Resource = { id: 'app', tab: 'applications', title: details.posting,
      details: { ...details, documentAt: '2026-10-01', documentResult: '합격', writtenAt: '2026-10-15' } }
    const incoming = toApplicationPayload({ ...details, checklist: serializeChecklist([second]) }, 'document')
    const saved = overlayApplication(existing, incoming)
    expect(saved.details).toMatchObject({ documentAt: '2026-10-01', documentResult: '합격', writtenAt: '2026-10-15' })
    expect(parseChecklist(saved.details?.checklist)).toEqual([first, second])
  })
})
