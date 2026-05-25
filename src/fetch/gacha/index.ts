import { Get, Post } from '@/fetch'

import type {
  CreateGachaConfigReqBody,
  DeleteGachaConfigReqBody,
  GachaConfig,
  GetGachaConfigListReqParams,
  UpdateGachaConfigReqBody
} from './types'

/** 祈愿相关接口路径（/private-api/v1） */
const PRIVATE_GACHA_API = {
  CONFIG_LIST: '/private-api/v1/gacha/config/list',
  CONFIG_CREATE: '/private-api/v1/gacha/config/create',
  CONFIG_UPDATE: '/private-api/v1/gacha/config/update',
  CONFIG_DELETE: '/private-api/v1/gacha/config/delete'
} as const

/** 获取祈愿配置列表 */
export function pr_v1_gacha_config_list(params?: GetGachaConfigListReqParams) {
  return Get<GachaConfig[]>(PRIVATE_GACHA_API.CONFIG_LIST, params)
}

/** 创建祈愿配置 */
export function pr_v1_gacha_config_create(body: CreateGachaConfigReqBody) {
  return Post<GachaConfig>(PRIVATE_GACHA_API.CONFIG_CREATE, body)
}

/** 更新祈愿配置 */
export function pr_v1_gacha_config_update(body: UpdateGachaConfigReqBody) {
  return Post<null>(PRIVATE_GACHA_API.CONFIG_UPDATE, body)
}

/** 删除祈愿配置 */
export function pr_v1_gacha_config_delete(body: DeleteGachaConfigReqBody) {
  return Post<null>(PRIVATE_GACHA_API.CONFIG_DELETE, body)
}
