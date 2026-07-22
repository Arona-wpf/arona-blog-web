/** 获取版本响应 */
export interface GetVersionResData {
  version: string
}

/** 依赖信息 */
export interface DependencyInfo {
  name: string
  version: string
}

/** 获取依赖响应 */
export interface GetDependenciesResData {
  dependencies: DependencyInfo[]
}

/** 设置系统配置请求 */
export interface SetConfigReqBody {
  key: string
  value: string
}

/** 创建系统配置请求 */
export interface CreateConfigReqBody {
  name: string
  key: string
  value?: string
  description?: string
}

/** 系统配置项 */
export interface SystemConfigItem {
  _id: string
  name: string
  key: string
  value: string
  description: string
  creator: string
  updator: string
  created_at: number
  updated_at: number
  seq?: number
}

/** 按 key 首段分组的配置映射 */
export type GroupedConfigMap = Record<string, SystemConfigItem[]>
