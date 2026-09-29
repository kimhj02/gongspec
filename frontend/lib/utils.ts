/** 조건부 클래스 이름을 합치고 서로 충돌하는 Tailwind 클래스의 우선순위를 정리한다. */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
