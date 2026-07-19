import { Post } from '@/fetch'

import type { RoleListReqBody, RoleListResData } from './types'

/** 角色相关接口路径（/private-api/v1） */
const PRIVATE_ROLE_API = {
  LIST: '/private-api/v1/role/list'
} as const

/** 获取角色列表 */
export function pr_v1_role_list(body: RoleListReqBody) {
  return Post<RoleListResData>(PRIVATE_ROLE_API.LIST, body)
}
