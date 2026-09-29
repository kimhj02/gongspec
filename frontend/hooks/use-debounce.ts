/** 입력이 일정 시간 멈춘 뒤 값을 갱신해 검색 요청이 매 타이핑마다 발생하지 않도록 한다. */
import { useEffect, useState } from 'react'

export function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debounced
}
