import type { Gender } from '@/definitions/types/gender.types'

/** 用户登录请求 */
export interface UserLoginReqBody {
  account?: string
  password?: string
  email?: string
  cache_id?: string
  captcha?: string
}

/** 登录响应用户信息 */
export interface LoginResData {
  _id: string
  account: string
  nickname: string
  avatar: string
  birthday: string
  gender: Gender
  email: string
  roles: string[]
  permissions: string[]
}
