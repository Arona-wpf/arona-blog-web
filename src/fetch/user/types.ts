import type { Gender } from '@/definitions/types/gender.types'

/** 检查账号是否存在响应 */
export interface CheckAccountResData {
  masked_email: string
  email: string
}

/** 更新用户资料请求 */
export interface UpdateProfileReqBody {
  nickname?: string
  avatar?: string
  gender?: Gender
  birthday?: string
}

/** 修改密码请求 */
export interface ChangePasswordReqBody {
  old_password: string
  new_password: string
  confirm_password: string
}

/** 重置密码请求 */
export interface ResetPasswordReqBody {
  account: string
  password: string
  confirm_password: string
  cache_id: string
}
