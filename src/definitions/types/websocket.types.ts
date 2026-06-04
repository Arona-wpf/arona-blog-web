import type { LogTypeEnum } from '@/fetch/log/types'

/**
 * 日志订阅确认事件数据
 */
export interface LogSubscribedData {
  type: LogTypeEnum
  filename: string
  message: string
}

/**
 * 日志初始化事件数据
 */
export interface LogInitData {
  type: LogTypeEnum
  lines: string[]
  totalLines: number
}

/**
 * 日志更新事件数据
 */
export interface LogUpdateData {
  type: LogTypeEnum
  lines: string[]
}

/**
 * 祈愿同步日志推送数据
 */
export interface GachaSyncLogData {
  message: string
  status: 'processing' | 'completed' | 'failed'
}
