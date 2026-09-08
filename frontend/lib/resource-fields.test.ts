import { describe, expect, it } from 'vitest'
import { filledDetails, fieldsByTab, groupEssaysByPosting, initialFieldValues, overlayApplication, parseEssayEntries, parsePeriodRange, toApplicationPayload, toDateInputValue, toEssayPayload, toResourcePayload } from './resource-fields'

describe('resource fields', () => {
  it('fills select defaults so they are saved without user change', () => {
    const values = initialFieldValues('applications')
    expect(values.category).toBe('정규직')
    expect(values.documentResult).toBeUndefined()

    const payload = toResourcePayload('applications', '', { ...values, institution: '서울시' })
    expect(payload.details?.category).toBe('정규직')
    expect(payload.title).toBe('서울시')
  })

  it('normalizes compact dates for date inputs', () => {
    expect(toDateInputValue('20260101')).toBe('2026-01-01')
    expect(toDateInputValue('2026.01.01')).toBe('2026-01-01')
    expect(toDateInputValue('2026-01-01')).toBe('2026-01-01')
    expect(toDateInputValue('2024.03')).toBe('2024-03-01')
  })

  it('parses a stored education period into a date range', () => {
    expect(parsePeriodRange('2024.03 ~ 2024.06')).toEqual({ start: '2024-03-01', end: '2024-06-01' })
    expect(parsePeriodRange('2026.09.01 ~ 2026.09.10')).toEqual({ start: '2026-09-01', end: '2026-09-10' })
  })

  it('saves an education period from calendar dates', () => {
    const payload = toResourcePayload('education', '', {
      subject: '헌법',
      periodStart: '2026-09-01',
      periodEnd: '2026-09-10',
    })
    expect(payload.details?.period).toBe('2026.09.01 ~ 2026.09.10')
    expect(payload.date).toBe('2026-09-01')
  })

  it('uses issuer as subtitle when institution is empty', () => {
    const payload = toResourcePayload('certificate', '정보처리기사', {
      issuer: '한국산업인력공단',
      acquiredAt: '2024-06-01',
    })
    expect(payload.subtitle).toBe('한국산업인력공단')
    expect(payload.date).toBe('2024-06-01')
  })

  it('uses subject as the education title', () => {
    const payload = toResourcePayload('education', '', { subject: '헌법', credits: '3학점' })
    expect(payload.title).toBe('헌법')
    expect(payload.subtitle).toBe('')
  })

  it('saves only the selected application stage', () => {
    const payload = toApplicationPayload(
      {
        category: '정규직',
        institution: '서울시',
        documentAt: '2026-09-10',
        writtenAt: '2026-09-20',
      },
      'document',
    )
    expect(payload.title).toBe('서울시')
    expect(payload.details).toEqual({
      category: '정규직',
      institution: '서울시',
      documentAt: '2026-09-10',
      documentResult: '대기중',
    })
    expect(payload.subtitle).toBe('서류')
  })

  it('merges a later stage onto an existing application', () => {
    const payload = overlayApplication(
      {
        id: '1',
        tab: 'applications',
        title: '서울시',
        details: { institution: '서울시', documentAt: '2026-09-10', documentResult: '합격' },
      },
      {
        tab: 'applications',
        title: '서울시',
        details: { institution: '서울시', writtenAt: '2026-09-20' },
      },
    )
    expect(payload.details).toMatchObject({
      documentAt: '2026-09-10',
      documentResult: '합격',
      writtenAt: '2026-09-20',
      writtenResult: '대기중',
    })
    expect(payload.subtitle).toBe('서류, 필기')
  })

  it('stores multiple essay items on one posting', () => {
    const payload = toEssayPayload('서울시 9급', [
      { item: '지원동기', essay: '공공의 이익을 위해 지원했습니다.' },
      { item: '성장과정', essay: '동아리 활동을 통해 성장했습니다.' },
      { item: '', essay: '' },
    ])
    expect(payload.title).toBe('서울시 9급')
    expect(JSON.parse(payload.details?.entries ?? '[]')).toEqual([
      { item: '지원동기', essay: '공공의 이익을 위해 지원했습니다.' },
      { item: '성장과정', essay: '동아리 활동을 통해 성장했습니다.' },
    ])
    expect(parseEssayEntries(payload)).toHaveLength(2)
  })

  it('reads legacy single-item essays', () => {
    expect(
      parseEssayEntries({
        subtitle: '지원동기',
        body: '한 줄 자소서',
        details: { item: '지원동기', essay: '한 줄 자소서' },
      }),
    ).toEqual([{ item: '지원동기', essay: '한 줄 자소서' }])
  })

  it('groups essays by posting name', () => {
    const groups = groupEssaysByPosting([
      { id: '1', tab: 'essays', title: '서울시 9급', subtitle: '지원동기' },
      { id: '2', tab: 'essays', title: '서울시 9급', subtitle: '성장과정' },
      { id: '3', tab: 'essays', title: '경기도 7급', subtitle: '지원동기' },
    ])
    expect(groups.map(([name, items]) => [name, items.length])).toEqual([
      ['서울시 9급', 2],
      ['경기도 7급', 1],
    ])
  })

  it('exposes filled details for card rendering', () => {
    const rows = filledDetails({
      id: '1',
      tab: 'certificate',
      title: '정보처리기사',
      details: { issuer: '한국산업인력공단', credential: '' },
    })
    expect(rows).toEqual([
      { label: '발급기관', value: '한국산업인력공단' },
    ])
  })

  it('calculates certificate expiry from validity years', () => {
    const payload = toResourcePayload('certificate', '정보처리기사', {
      issuer: '한국산업인력공단',
      acquiredAt: '2026-09-02',
      validity: '5년',
    })
    expect(payload.details).toMatchObject({ validity: '5년', expiresAt: '2031-09-02' })
  })

  it('omits expiry when a certificate is permanent', () => {
    const payload = toResourcePayload('certificate', '정보처리기사', {
      acquiredAt: '2026-09-02',
      validity: '영구',
      expiresAt: '2030-01-01',
    })
    expect(payload.details?.validity).toBe('영구')
    expect(payload.details?.expiresAt).toBeUndefined()
  })

  it('lets career employment type be intern, contract, or full-time', () => {
    const field = fieldsByTab.career.find((item) => item.key === 'employmentType')
    expect(field?.type).toBe('select')
    expect(field?.options).toEqual(['인턴', '계약직', '정규직'])
    expect(initialFieldValues('career').employmentType).toBe('인턴')
  })

  it('lets career work period be picked on a calendar and drops leaving reason', () => {
    expect(fieldsByTab.career.find((item) => item.key === 'period')?.type).toBe('daterange')
    expect(fieldsByTab.career.some((item) => item.key === 'reasonForLeaving')).toBe(false)
    const payload = toResourcePayload('career', '', {
      institution: '서울시',
      periodStart: '2022-01-03',
      periodEnd: '2024-02-28',
      reasonForLeaving: '이직',
    })
    expect(payload.details?.period).toBe('2022.01.03 ~ 2024.02.28')
    expect(payload.details?.reasonForLeaving).toBeUndefined()
  })

  it('does not collect a certificate homepage', () => {
    expect(fieldsByTab.certificate.some((field) => field.key === 'homepage')).toBe(false)
  })

  it('includes permanent as a certificate validity option', () => {
    expect(fieldsByTab.certificate.find((field) => field.key === 'validity')?.options).toContain('영구')
    expect(initialFieldValues('certificate').validity).toBe('영구')
  })

  it('treats application homepage as optional free text', () => {
    const field = fieldsByTab.applications.find((item) => item.key === 'homepage')
    expect(field?.required).toBeFalsy()
    expect(field?.type).not.toBe('url')
  })
})
