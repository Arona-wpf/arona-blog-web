import { Get, Post } from '@/fetch'
import type { LoginResData } from '@/fetch/login/types'

import type { ChangePasswordReqBody, UpdateProfileReqBody } from './types'

/** 用户相关接口路径（/public-api/v1） */
const PUBLIC_USER_API = {
  STATUS: '/public-api/v1/user/status'
} as const

/** 用户相关接口路径（/private-api/v1） */
const PRIVATE_USER_API = {
  UPDATE_PROFILE: '/private-api/v1/user/update-profile',
  CHANGE_PASSWORD: '/private-api/v1/user/change-password'
} as const

/** 获取当前登录状态 */
export function pu_v1_user_status() {
  return Get<LoginResData | null>(PUBLIC_USER_API.STATUS)
}

/** 更新用户资料 */
export function pr_v1_user_update_profile(body: UpdateProfileReqBody) {
  return Post<LoginResData>(PRIVATE_USER_API.UPDATE_PROFILE, body)
}

/** 修改密码 */
export function pr_v1_user_change_password(body: ChangePasswordReqBody) {
  return Post<null>(PRIVATE_USER_API.CHANGE_PASSWORD, body)
}
