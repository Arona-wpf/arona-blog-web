import { Get } from '@/fetch'
import type { LoginResData } from '@/fetch/login/types'

/** 用户相关接口路径（/public-api/v1） */
const PUBLIC_USER_API = {
  STATUS: '/public-api/v1/user/status'
} as const

/** 获取当前登录状态 */
export function pu_v1_user_status() {
  return Get<LoginResData | null>(PUBLIC_USER_API.STATUS)
}
