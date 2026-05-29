/** 同一 URL 的最小请求间隔（秒） */
export const REQUEST_INTERVAL = 30

/** 请求结果缓存时长（秒） */
export const STORAGE_DURATION = 300

/** HTTP 请求 Promise 缓存（用于去重并发请求） */
export const HTTP_CACHE_MAP = new Map<string, Promise<any>>()

/** URL 请求时间戳缓存（用于节流与防抖控制） */
export const URL_REQUEST_CACHE_MAP = new Map<string, { timer: number; lock: string }>()

/** HTTP 基础请求路径 */
export const HTTP_BASE_URL = '/'

/** HTTP 请求超时时间（毫秒） */
export const HTTP_TIMEOUT = 30 * 1000
