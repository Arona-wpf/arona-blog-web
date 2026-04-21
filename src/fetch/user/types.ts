import type { Gender } from '@/definitions/types/gender.types'

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
