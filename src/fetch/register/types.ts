import type { Gender } from '@/definitions/types/gender.types'

/** 用户注册请求 */
export interface RegisterReqBody {
  account: string
  password: string
  nickname: string
  birthday: string
  gender: Gender
  email: string
  cache_id: string
}
