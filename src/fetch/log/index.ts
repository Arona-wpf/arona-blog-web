import { Get, Post } from '@/fetch'

import type { GetLogContentBody, LogContentData, LogFileInfo, LogTypeEnum } from './types'

/** 日志相关接口路径（/private-api/v1） */
const PRIVATE_LOG_API = {
  TYPES: '/private-api/v1/log/types',
  FILES: '/private-api/v1/log/files',
  CURRENT: '/private-api/v1/log/current',
  CONTENT: '/private-api/v1/log/content'
} as const

/** 获取日志类型列表 */
export function pr_v1_log_types() {
  return Get<LogTypeEnum[]>(PRIVATE_LOG_API.TYPES)
}

/** 获取日志文件列表 */
export function pr_v1_log_files(type: LogTypeEnum) {
  return Get<LogFileInfo[]>(PRIVATE_LOG_API.FILES, { type })
}

/** 获取当前日志文件 */
export function pr_v1_log_current(type: LogTypeEnum) {
  return Get<{ filename: string; size: number }>(PRIVATE_LOG_API.CURRENT, { type })
}

/** 获取日志内容 */
export function pr_v1_log_content(body: GetLogContentBody) {
  return Post<LogContentData>(PRIVATE_LOG_API.CONTENT, body)
}
