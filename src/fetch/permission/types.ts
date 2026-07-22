/** 权限信息 */
export interface PermissionListItem {
  _id: string
  name: string
  group: 'user' | 'role' | 'permission' | 'log'
  type: 'api' | 'menu'
  code: string
  action: 'create' | 'delete' | 'update' | 'view'
  created_at: number
  updated_at: number
}

/** 权限列表请求参数 */
export interface PermissionListReqBody {
  current_page: number
  page_size: number
  group?: string
  type?: string
  action?: string
}

/** 权限列表响应 */
export interface PermissionListResData {
  list: PermissionListItem[]
  total: number
  current_page: number
  page_size: number
}
