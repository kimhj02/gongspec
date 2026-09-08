'use client'

import { useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import ModalShell from '@/components/modal-shell'
import { getApiError, type Resource, type ResourceTab } from '@/lib/api'
import {
  applicationCommonFields,
  applicationStages,
  defaultApplicationStage,
  emptyEssayEntry,
  fieldsByTab,
  initialFieldValues,
  parseEssayEntries,
  resolveResourceTitle,
  titleFieldByTab,
  toApplicationPayload,
  toEssayPayload,
  toResourcePayload,
  type ApplicationStageId,
  type EssayEntry,
  type Field,
} from '@/lib/resource-fields'
import { tabCopy } from '@/lib/tabs'

export default function ResourceForm({
  initial,
  activeTab,
  defaultTitle = '',
  appendEmptyEntry = false,
  postingNames = [],
  onClose,
  onSave,
}: {
  initial: Resource | null
  activeTab: ResourceTab
  defaultTitle?: string
  appendEmptyEntry?: boolean
  postingNames?: string[]
  onClose: () => void
  onSave: (data: Omit<Resource, 'id'>) => Promise<void>
}) {
  const tab = initial?.tab ?? activeTab
  const fields = fieldsByTab[tab]
  const isEssay = tab === 'essays'
  const isApplication = tab === 'applications'
  const titleKey = titleFieldByTab[tab]
  const hideTitle = Boolean(titleKey)
  const [title, setTitle] = useState(initial?.title ?? defaultTitle)
  const [values, setValues] = useState<Record<string, string>>(() => initialFieldValues(tab, initial?.details, initial?.title ?? defaultTitle))
  const [stageId, setStageId] = useState<ApplicationStageId>(() => defaultApplicationStage(initial?.details))
  const [entries, setEntries] = useState<EssayEntry[]>(() => {
    const parsed = initial ? parseEssayEntries(initial) : []
    const rows = parsed.length ? parsed : [emptyEssayEntry()]
    return appendEmptyEntry ? [...rows, emptyEssayEntry()] : rows
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const setValue = (key: string, value: string) => setValues((current) => ({ ...current, [key]: value }))
  const setEntry = (index: number, patch: Partial<EssayEntry>) => {
    setEntries((current) => current.map((entry, entryIndex) => (entryIndex === index ? { ...entry, ...patch } : entry)))
  }

  const resolvedTitle = hideTitle ? resolveResourceTitle(tab, title, values) : title

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!resolvedTitle.trim()) return
    if (isEssay && !entries.some((entry) => entry.item.trim() || entry.essay.trim())) {
      setError('자기소개서 항목을 하나 이상 추가해 주세요.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSave(isEssay ? toEssayPayload(title, entries) : isApplication ? toApplicationPayload(values, stageId, initial?.details) : toResourcePayload(tab, resolvedTitle, values))
    } catch (caught) {
      setError(getApiError(caught))
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalShell onClose={onClose} labelledBy="resource-form-title" className={`resource-form-card ${isEssay ? 'essay-form-card' : ''}`}>
      <div className="modal-header">
        <div className="page-intro-copy">
          <div className="eyebrow">{initial ? 'EDIT RESOURCE' : 'NEW RESOURCE'}</div>
          <h2 id="resource-form-title">{initial ? tabCopy[tab].editLabel : tabCopy[tab].createLabel}</h2>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="닫기">
          <X size={18} />
        </button>
      </div>
      <form onSubmit={(event) => void submit(event)}>
        {hideTitle ? null : (
          <label>
            {isEssay ? '공고 이름 *' : '제목 *'}
            <input
              autoFocus
              list={isEssay ? 'posting-names' : undefined}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={isEssay ? '예: 서울시 9급' : tab === 'memo' ? '메모 제목' : '자료 제목'}
              required
            />
          </label>
        )}
        {isEssay ? (
          <datalist id="posting-names">
            {postingNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        ) : null}
        {isEssay ? (
          <div className="essay-entry-list">
            {entries.map((entry, index) => (
              <section className="essay-entry" key={index}>
                <label>
                  <span className="field-label-row">
                    자기소개서 항목
                    {entries.length > 1 ? (
                      <button
                        type="button"
                        className="icon-button"
                        onClick={(event) => {
                          event.preventDefault()
                          setEntries((current) => current.filter((_, entryIndex) => entryIndex !== index))
                        }}
                        aria-label="항목 삭제"
                      >
                        <Trash2 size={15} />
                      </button>
                    ) : null}
                  </span>
                  <input
                    value={entry.item}
                    onChange={(event) => setEntry(index, { item: event.target.value })}
                    placeholder="예: 지원동기, 성장과정, 입사 후 포부"
                  />
                </label>
                <label>
                  <span className="field-label-row">
                    자기소개서
                    <span className="char-count" aria-live="polite">
                      공백 포함 {entry.essay.length}자 · 공백 제외 {entry.essay.replace(/\s/g, '').length}자
                    </span>
                  </span>
                  <textarea
                    value={entry.essay}
                    onChange={(event) => setEntry(index, { essay: event.target.value })}
                    placeholder="해당 항목의 자기소개서를 작성해 주세요."
                    rows={8}
                  />
                </label>
              </section>
            ))}
            <button type="button" className="secondary-button essay-add-entry" onClick={() => setEntries((current) => [...current, emptyEssayEntry()])}>
              <Plus size={15} />
              <span>항목 추가</span>
            </button>
          </div>
        ) : isApplication ? (
          <>
            <div className="detail-form-grid">
              {applicationCommonFields.map((field) => (
                <FieldControl key={field.key} field={field} values={values} autoFocus={field.key === titleKey} onChange={setValue} />
              ))}
            </div>
            <div className="application-stage-picker">
              <span>전형</span>
              <div className="stage-tabs" role="tablist" aria-label="전형">
                {applicationStages.map((stage) => (
                  <button
                    key={stage.id}
                    type="button"
                    role="tab"
                    aria-selected={stage.id === stageId}
                    className={`stage-tab ${stage.id === stageId ? 'active' : ''}`}
                    onClick={() => setStageId(stage.id)}
                  >
                    {stage.label}
                  </button>
                ))}
              </div>
              <p>지금은 {applicationStages.find((stage) => stage.id === stageId)?.label}만 작성하면 됩니다. 나머지 전형은 날짜가 정해진 뒤에 추가하세요.</p>
            </div>
            <div className="detail-form-grid application-stage-fields">
              {applicationStages
                .find((stage) => stage.id === stageId)
                ?.fields.map((field) => (
                  <FieldControl key={field.key} field={field} values={values} onChange={setValue} />
                ))}
            </div>
          </>
        ) : (
          <div className="detail-form-grid">
            {fields.map((field) => (
              <FieldControl key={field.key} field={field} values={values} autoFocus={hideTitle && field.key === titleKey} onChange={setValue} />
            ))}
          </div>
        )}
        {error ? <p className="form-error">{error}</p> : null}
        <div className="form-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            취소
          </button>
          <button className="primary-button" disabled={saving || !resolvedTitle.trim()}>
            {saving ? '저장 중...' : initial ? '수정' : '추가'}
            <Plus size={16} />
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

function FieldControl({
  field,
  values,
  autoFocus = false,
  onChange,
}: {
  field: Field
  values: Record<string, string>
  autoFocus?: boolean
  onChange: (key: string, value: string) => void
}) {
  return (
    <label>
      {field.required ? `${field.label} *` : field.label}
      {field.type === 'textarea' ? (
        <textarea
          value={values[field.key] ?? ''}
          onChange={(event) => onChange(field.key, event.target.value)}
          placeholder={field.placeholder}
          rows={field.rows ?? 4}
          required={field.required}
        />
      ) : field.type === 'select' ? (
        <select value={values[field.key] ?? field.options?.[0] ?? ''} onChange={(event) => onChange(field.key, event.target.value)} required={field.required}>
          {field.options?.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input
          autoFocus={autoFocus}
          type={field.type ?? 'text'}
          value={values[field.key] ?? ''}
          onChange={(event) => onChange(field.key, event.target.value)}
          placeholder={field.placeholder}
          required={field.required}
        />
      )}
    </label>
  )
}
