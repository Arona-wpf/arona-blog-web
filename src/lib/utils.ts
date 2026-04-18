import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 睡眠函数 单位：毫秒
 * @param ms 睡眠时间
 * @returns Promise<void>
 */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
