import { Post } from '@/fetch'

import type { LoginResData, UserLoginReqBody } from './types'

/** 登录相关接口路径（/public-api/v1） */
const PUBLIC_LOGIN_API = {
  LOGIN: '/public-api/v1/login'
} as const

/** 用户登录 */
export function pu_v1_login(body: UserLoginReqBody) {
  return Post<LoginResData>(PUBLIC_LOGIN_API.LOGIN, body)
}
