/** 角色信息 */
export interface RoleListItem {
  _id: string
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

/** 角色简要信息（用于下拉选择） */
export interface RoleSimpleItem {
  _id: string
  name: string
  code: string
}

/** 所有角色列表响应 */
export interface RoleAllResData {
  list: RoleSimpleItem[]
}

/** 更新角色请求参数 */
export interface RoleUpdateReqBody {
  _id: string
  api_permissions?: string[]
  menu_permissions?: string[]
}
