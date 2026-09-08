export type HolidayMap = Record<string, string>

type HolidayItem = {
  date?: string
  localName?: string
  types?: string[]
}

export function holidayMapFrom(items: HolidayItem[]) {
  const map: HolidayMap = {}
  for (const item of items) {
    if (!item.date || !item.localName) continue
    if (item.types && !item.types.includes('Public')) continue
    map[item.date] = map[item.date] ? `${map[item.date]} · ${item.localName}` : item.localName
  }
  return map
}

export async function fetchKoreanHolidays(year: number): Promise<HolidayMap> {
  const response = await fetch(`/holiday-api/${year}`)
  if (!response.ok) throw new Error('공휴일을 불러오지 못했습니다.')
  return holidayMapFrom((await response.json()) as HolidayItem[])
}
