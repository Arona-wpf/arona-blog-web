// 请求间隙
export const REQUEST_INTERVAL = 30

// 存储时长
export const STORAGE_DURATION = 300

// http缓存
export const HTTP_CACHE_MAP = new Map<string, Promise<any>>()

// 缓存url请求时间戳
export const URL_REQUEST_CACHE_MAP = new Map<string, { timer: number; lock: string }>()

// http
export const HTTP_BASE_URL = '/'

// http超时时间
export const HTTP_TIMEOUT = 30 * 1000
