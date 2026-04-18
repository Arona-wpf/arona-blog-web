import { Post } from '@/fetch'

import type { RegisterReqBody } from './types'

/** 注册相关接口路径（/public-api/v1） */
const PUBLIC_REGISTER_API = {
  REGISTER: '/public-api/v1/register'
} as const

/** 用户注册 */
export function pu_v1_register(body: RegisterReqBody) {
  return Post<null>(PUBLIC_REGISTER_API.REGISTER, body)
}
