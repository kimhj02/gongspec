import useSWR from 'swr'
import { fetchKoreanHolidays } from '@/lib/korean-holidays'

export function useKoreanHolidays(year: number) {
  return useSWR(['korean-holidays', year], () => fetchKoreanHolidays(year), {
    revalidateOnFocus: false,
    dedupingInterval: 60 * 60 * 1000,
  })
}
