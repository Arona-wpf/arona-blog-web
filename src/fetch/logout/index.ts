import { Post } from '@/fetch'

/** 退出登录相关接口路径（/private-api/v1） */
const PRIVATE_LOGOUT_API = {
  LOGOUT: '/private-api/v1/logout'
} as const

/** 退出登录 */
export function pr_v1_logout() {
  return Post<null>(PRIVATE_LOGOUT_API.LOGOUT)
}
