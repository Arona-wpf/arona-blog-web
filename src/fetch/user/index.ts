import { Get, Post } from '@/fetch'
import type { LoginResData } from '@/fetch/login/types'

import type {
  ChangePasswordReqBody,
  CheckAccountResData,
  CreateUserReqBody,
  DeleteUserReqBody,
  ResetPasswordReqBody,
  UpdateProfileReqBody,
  UpdateUserReqBody,
  UserListReqBody,
  UserListResData
} from './types'

/** 用户相关接口路径（/public-api/v1） */
const PUBLIC_USER_API = {
  STATUS: '/public-api/v1/user/status',
  CHECK_ACCOUNT: '/public-api/v1/user/check-account',
  RESET_PASSWORD: '/public-api/v1/user/reset-password'
} as const

/** 用户相关接口路径（/private-api/v1） */
const PRIVATE_USER_API = {
  LIST: '/private-api/v1/user/list',
  CREATE: '/private-api/v1/user/create',
  UPDATE: '/private-api/v1/user/update',
  DELETE: '/private-api/v1/user/delete',
  UPDATE_PROFILE: '/private-api/v1/user/update-profile',
  CHANGE_PASSWORD: '/private-api/v1/user/change-password'
} as const

/** 获取当前登录状态 */
export function pu_v1_user_status() {
  return Get<LoginResData | null>(PUBLIC_USER_API.STATUS)
}

/** 检查账号是否存在 */
export function pu_v1_user_check_account(account: string) {
  return Get<CheckAccountResData>(PUBLIC_USER_API.CHECK_ACCOUNT, { account })
}

/** 重置密码 */
export function pu_v1_user_reset_password(body: ResetPasswordReqBody) {
  return Post<null>(PUBLIC_USER_API.RESET_PASSWORD, body)
}

/** 获取用户列表 */
export function pr_v1_user_list(body: UserListReqBody) {
  return Post<UserListResData>(PRIVATE_USER_API.LIST, body)
}

/** 创建用户 */
export function pr_v1_user_create(body: CreateUserReqBody) {
  return Post<LoginResData>(PRIVATE_USER_API.CREATE, body)
}

/** 更新用户 */
export function pr_v1_user_update(body: UpdateUserReqBody) {
  return Post<LoginResData>(PRIVATE_USER_API.UPDATE, body)
}

/** 删除用户 */
export function pr_v1_user_delete(body: DeleteUserReqBody) {
  return Post<null>(PRIVATE_USER_API.DELETE, body)
}

/** 更新用户资料 */
export function pr_v1_user_update_profile(body: UpdateProfileReqBody) {
  return Post<LoginResData>(PRIVATE_USER_API.UPDATE_PROFILE, body)
}

/** 修改密码 */
export function pr_v1_user_change_password(body: ChangePasswordReqBody) {
  return Post<null>(PRIVATE_USER_API.CHANGE_PASSWORD, body)
}
