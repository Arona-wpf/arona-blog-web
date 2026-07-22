import type { Gender } from '@/definitions/types/gender.types'

/** 检查账号是否存在响应 */
export interface CheckAccountResData {
  email: string
}

/** 用户列表请求参数 */
export interface UserListReqBody {
  current_page: number
  page_size: number
  account?: string
  nickname?: string
  email?: string
}

/** 用户信息 */
export interface UserListItem {
  _id: string
  account: string
  nickname: string
  avatar: string
  birthday: string
  gender: Gender
  email: string
  roles: string[]
  created_at: number
  updated_at: number
}

/** 用户列表响应 */
export interface UserListResData {
  list: UserListItem[]
  total: number
  current_page: number
  page_size: number
}

/** 创建用户请求 */
export interface CreateUserReqBody {
  account: string
  password: string
  nickname: string
  birthday: string
  gender: Gender
  email: string
  roles?: string[]
}

/** 更新用户请求 */
export interface UpdateUserReqBody {
  _id: string
  nickname?: string
  email?: string
  birthday?: string
  gender?: Gender
  password?: string
  roles?: string[]
}

/** 删除用户请求 */
export interface DeleteUserReqBody {
  _id: string
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
  cache_id: string
  password: string
  confirm_password: string
}
