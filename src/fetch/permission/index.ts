import { Post } from '@/fetch'

import type { PermissionListReqBody, PermissionListResData } from './types'

/** 权限相关接口路径（/private-api/v1） */
const PRIVATE_PERMISSION_API = {
  LIST: '/private-api/v1/permission/list'
} as const

/** 获取权限列表 */
export function pr_v1_permission_list(body: PermissionListReqBody) {
  return Post<PermissionListResData>(PRIVATE_PERMISSION_API.LIST, body)
}
