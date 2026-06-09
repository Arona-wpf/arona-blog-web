import { Get, Post } from '@/fetch'

import type { CreateConfigReqBody, GetVersionResData, GroupedConfigMap, SetConfigReqBody } from './types'

/** 系统相关接口路径（/public-api/v1） */
const PUBLIC_SYSTEM_API = {
  GET_VERSION: '/public-api/v1/system/version'
} as const

const PRIVATE_CONFIG_API = {
  GET: '/private-api/v1/config/get',
  CREATE: '/private-api/v1/config/create',
  SET: '/private-api/v1/config/set'
} as const

/** 获取后端版本 */
export function pu_v1_system_version() {
  return Get<GetVersionResData>(PUBLIC_SYSTEM_API.GET_VERSION)
}

/** 获取按 key 首段分组的系统配置列表 */
export function pr_v1_config_get() {
  return Get<GroupedConfigMap>(PRIVATE_CONFIG_API.GET)
}

/** 创建系统配置 */
export function pr_v1_config_create(body: CreateConfigReqBody) {
  return Post<null>(PRIVATE_CONFIG_API.CREATE, body)
}

/** 按 key 设置系统配置 value */
export function pr_v1_config_set(body: SetConfigReqBody) {
  return Post<null>(PRIVATE_CONFIG_API.SET, body)
}
