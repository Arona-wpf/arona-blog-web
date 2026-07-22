import { Post } from '@/fetch'

import type { RoleAllResData, RoleListItem, RoleListReqBody, RoleListResData, RoleUpdateReqBody } from './types'

/** 角色相关接口路径（/private-api/v1） */
const PRIVATE_ROLE_API = {
  LIST: '/private-api/v1/role/list',
  ALL: '/private-api/v1/role/all',
  UPDATE: '/private-api/v1/role/update'
} as const

/** 获取角色列表 */
export function pr_v1_role_list(body: RoleListReqBody) {
  return Post<RoleListResData>(PRIVATE_ROLE_API.LIST, body)
}

/** 获取所有角色（用于下拉选择） */
export function pr_v1_role_all() {
  return Post<RoleAllResData>(PRIVATE_ROLE_API.ALL, {})
}

/** 更新角色 */
export function pr_v1_role_update(body: RoleUpdateReqBody) {
  return Post<RoleListItem>(PRIVATE_ROLE_API.UPDATE, body)
}
