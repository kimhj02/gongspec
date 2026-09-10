import { describe, expect, it } from 'vitest'
import { alioDateKey, hireTypeTags, recruitDday, recruitPeriodCompact, recruitPeriodLabel, sortRecruitsByDeadline, applicationDraftFromRecruit } from './recruits'
import type { PublicRecruit } from './api'

function recruit(partial: Partial<PublicRecruit>): PublicRecruit {
  return {
    id: '1',
    recrutPblntSn: 1,
    instNm: '',
    title: '',
    hireType: '정규직',
    hireTypes: '정규직',
    recrutSeNm: '',
    workRgnNmLst: '',
    pbancBgngYmd: '',
    pbancEndYmd: '',
    ongoing: true,
    srcUrl: '',
    recrutNope: null,
    ncsCdNmLst: '',
    ...partial,
  }
}

describe('recruit display', () => {
  it('normalizes compact alio dates', () => {
    expect(alioDateKey('20260930')).toBe('2026-09-30')
    expect(alioDateKey('2026-09-30')).toBe('2026-09-30')
    expect(alioDateKey('')).toBe('')
  })

  it('builds a period label and d-day from the end date', () => {
    expect(recruitPeriodLabel('20260901', '20260930')).toBe('2026년 9월 1일 → 2026년 9월 30일')
    expect(recruitPeriodCompact('20260901', '20260930')).toBe('2026.09.01 ~ 2026.09.30')
    expect(recruitDday('2026-09-16', '2026-09-09')).toBe('D-7')
    expect(recruitDday('20260909', '2026-09-09')).toBe('D-Day')
  })

  it('orders remaining deadlines first', () => {
    const sorted = sortRecruitsByDeadline(
      [
        recruit({ id: 'past', title: '지난 공고', pbancEndYmd: '2026-09-01' }),
        recruit({ id: 'later', title: '여유 공고', pbancEndYmd: '2026-09-20' }),
        recruit({ id: 'soon', title: '임박 공고', pbancEndYmd: '2026-09-10' }),
      ],
      '2026-09-09',
    )
    expect(sorted.map((item) => item.id)).toEqual(['soon', 'later', 'past'])
  })

  it('splits hire type tags', () => {
    expect(hireTypeTags('정규직,계약직')).toEqual(['정규직', '계약직'])
  })

  it('fills an application draft from a recruit notice', () => {
    expect(
      applicationDraftFromRecruit(
        recruit({
          instNm: '한국전력공사',
          title: '사무직 채용',
          hireType: '정규직',
          srcUrl: 'https://example.com/notice',
          pbancEndYmd: '20260916',
        }),
      ),
    ).toEqual({
      institution: '한국전력공사',
      posting: '사무직 채용',
      homepage: 'https://example.com/notice',
      documentAt: '2026-09-16',
      category: '정규직',
    })
    expect(
      applicationDraftFromRecruit(
        recruit({
          instNm: '한국전력공사',
          title: '사무직 채용',
          hireType: '',
          hireTypes: '계약직,인턴',
          srcUrl: 'https://example.com/notice',
          pbancEndYmd: '20260916',
        }),
      ),
    ).toMatchObject({ category: '계약직' })
    expect(
      applicationDraftFromRecruit(
        recruit({
          instNm: '한국전력공사',
          title: '사무직 채용',
          pbancEndYmd: '20260916',
        }),
      ),
    ).not.toHaveProperty('documentAnnouncementAt')
  })
})
