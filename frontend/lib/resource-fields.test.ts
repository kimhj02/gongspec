import { describe, expect, it } from 'vitest'
import { applicationPostingName, characterCountLabel, filledDetails, fieldsByTab, groupEssaysByPosting, initialFieldValues, interviewRounds, overlayApplication, parseEssayEntries, parsePeriodRange, resourceCardSubtitle, resourceCardTitle, toApplicationPayload, toDateInputValue, toEssayPayload, toResourcePayload } from './resource-fields'

describe('resource fields', () => {
  it('fills select defaults so they are saved without user change', () => {
    const values = initialFieldValues('applications')
    expect(values.category).toBe('정규직')
    expect(values.documentResult).toBeUndefined()

    const payload = toResourcePayload('applications', '', { ...values, institution: '서울교통공사', posting: '9급 행정직' })
    expect(payload.details?.category).toBe('정규직')
    expect(payload.title).toBe('9급 행정직')
    expect(payload.subtitle).toBe('서울교통공사')
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

  it('uses the course name as the training title and the institution as the subtitle', () => {
    const payload = toResourcePayload('training', '', {
      institution: '에듀퓨어',
      subject: 'NCS 사무행정',
      ncs: '02010101',
      hours: '28',
    })
    expect(payload.title).toBe('NCS 사무행정')
    expect(payload.subtitle).toBe('에듀퓨어')
    expect(
      filledDetails({
        id: '1',
        tab: 'training',
        title: payload.title,
        subtitle: payload.subtitle,
        details: payload.details,
      }).map((row) => row.label),
    ).toEqual(['NCS분류', '교육시간'])
  })

  it('saves only the selected application stage', () => {
    const payload = toApplicationPayload(
      {
        category: '정규직',
        institution: '서울교통공사',
        posting: '9급 행정직',
        documentAt: '2026-09-10',
        writtenAt: '2026-09-20',
      },
      'document',
    )
    expect(payload.title).toBe('9급 행정직')
    expect(payload.subtitle).toBe('서울교통공사')
    expect(payload.details).toEqual({
      category: '정규직',
      institution: '서울교통공사',
      posting: '9급 행정직',
      documentAt: '2026-09-10',
      documentResult: '대기중',
    })
    expect(payload.tags).toEqual(['서류'])
  })

  it('merges a later stage onto an existing application', () => {
    const payload = overlayApplication(
      {
        id: '1',
        tab: 'applications',
        title: '9급 행정직',
        subtitle: '서울교통공사',
        details: { institution: '서울교통공사', posting: '9급 행정직', documentAt: '2026-09-10', documentResult: '합격' },
      },
      {
        tab: 'applications',
        title: '9급 행정직',
        details: { institution: '서울교통공사', posting: '9급 행정직', writtenAt: '2026-09-20' },
      },
    )
    expect(payload.details).toMatchObject({
      documentAt: '2026-09-10',
      documentResult: '합격',
      writtenAt: '2026-09-20',
      writtenResult: '대기중',
    })
    expect(payload.title).toBe('9급 행정직')
    expect(payload.subtitle).toBe('서울교통공사')
    expect(payload.tags).toEqual(['서류', '필기'])
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
      { label: '발급기관', value: '한국산업인력공단', countChars: false },
    ])
  })

  it('keeps the training course name as the card title for older records', () => {
    const item = {
      id: '1',
      tab: 'training' as const,
      title: '에듀퓨어',
      subtitle: 'NCS 사무행정',
      details: { institution: '에듀퓨어', subject: 'NCS 사무행정', ncs: '02010101' },
    }
    expect(resourceCardTitle(item)).toBe('NCS 사무행정')
    expect(resourceCardSubtitle(item)).toBe('에듀퓨어')
    expect(filledDetails(item).map((row) => row.label)).toEqual(['NCS분류'])
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

  it('lets essays follow the application posting name', () => {
    expect(
      applicationPostingName({
        title: '서울시',
        details: { institution: '서울교통공사', posting: '9급 행정직' },
      }),
    ).toBe('9급 행정직')
    expect(applicationPostingName({ title: '옛 공고', details: {} })).toBe('옛 공고')
  })

  it('counts spaces the same way the essay form does', () => {
    expect(characterCountLabel('공공 이익')).toBe('(공백 포함 5자 · 공백 제외 4자)')
    expect(fieldsByTab.education.find((field) => field.key === 'content')?.countChars).toBe(true)
    expect(fieldsByTab.training.find((field) => field.key === 'content')?.countChars).toBe(true)
    expect(fieldsByTab.career.find((field) => field.key === 'responsibilities')?.countChars).toBe(true)
    expect(fieldsByTab.memo.find((field) => field.key === 'content')?.countChars).toBeFalsy()
  })

  it('shows character counts on education content in filled details', () => {
    expect(
      filledDetails({
        id: '1',
        tab: 'education',
        title: '헌법',
        details: { content: '기본권 사례를 정리했다.' },
      }),
    ).toEqual([{ label: '내용', value: '기본권 사례를 정리했다.', countChars: true }])
  })

  it('saves a later interview round without wiping the first', () => {
    const payload = overlayApplication(
      {
        id: '1',
        tab: 'applications',
        title: '9급 행정직',
        details: {
          institution: '서울교통공사',
          posting: '9급 행정직',
          interviewAt: '2026-10-05',
          interviewResult: '합격',
        },
      },
      {
        tab: 'applications',
        title: '9급 행정직',
        details: {
          institution: '서울교통공사',
          posting: '9급 행정직',
          interview2At: '2026-10-20',
        },
      },
    )
    expect(payload.details).toMatchObject({
      interviewAt: '2026-10-05',
      interviewResult: '합격',
      interview2At: '2026-10-20',
      interview2Result: '대기중',
    })
    expect(payload.tags).toEqual(['면접'])
  })

  it('exposes first through third interview rounds under the interview stage', () => {
    expect(interviewRounds.map((round) => round.label)).toEqual(['1차', '2차', '3차'])
    expect(fieldsByTab.applications.some((field) => field.key === 'interview2At')).toBe(true)
    expect(fieldsByTab.applications.some((field) => field.key === 'interview3At')).toBe(true)
  })

  it('treats application homepage as optional free text', () => {
    const field = fieldsByTab.applications.find((item) => item.key === 'homepage')
    expect(field?.required).toBeFalsy()
    expect(field?.type).not.toBe('url')
  })
})
