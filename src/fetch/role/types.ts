/** 角色信息 */
export interface RoleListItem {
  _id: string
  seq?: number
  name: string
  code: string
  api_permissions: string[]
  menu_permissions: string[]
  created_at: number
  updated_at: number
}

/** 角色列表请求参数 */
export interface RoleListReqBody {
  current_page: number
  page_size: number
  code?: string
  start_at?: number
  end_at?: number
}

/** 角色列表响应 */
export interface RoleListResData {
  list: RoleListItem[]
  total: number
  current_page: number
  page_size: number
}
