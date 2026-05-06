import { Get } from '@/fetch'

import type { GetVersionResData } from './types'

/** 系统相关接口路径（/public-api/v1） */
const PUBLIC_SYSTEM_API = {
  GET_VERSION: '/public-api/v1/system/version'
} as const

/** 获取后端版本 */
export function pu_v1_system_version() {
  return Get<GetVersionResData>(PUBLIC_SYSTEM_API.GET_VERSION)
}
