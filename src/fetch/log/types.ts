/** 日志类型枚举 */
export type LogTypeEnum = 'app' | 'core' | 'queue' | 'ws' | 'error'

/** 日志文件信息 */
export interface LogFileInfo {
  filename: string
  size: number
  modifiedTime: string
  isHistory: boolean
}

/** 获取日志内容请求体 */
export interface GetLogContentBody {
  type: LogTypeEnum
  filename: string
  startLine?: number
  limit?: number
}

/** 日志内容响应数据 */
export interface LogContentData {
  lines: string[]
  totalLines: number
  hasMore: boolean
  startLine: number
  limit: number
}
