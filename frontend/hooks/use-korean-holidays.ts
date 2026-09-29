/** 연도별 공휴일 조회를 SWR로 캐시하고 같은 연도의 중복 요청을 줄인다. */
import useSWR from 'swr'
import { fetchKoreanHolidays } from '@/lib/korean-holidays'

export function useKoreanHolidays(year: number) {
  return useSWR(['korean-holidays', year], () => fetchKoreanHolidays(year), {
    revalidateOnFocus: false,
    dedupingInterval: 60 * 60 * 1000,
  })
}
