import { type AxiosRequestConfig } from 'axios'

import { RequestMethodEnum } from '@/definitions/enums/request.enums'
import { Get, Post } from '@/fetch'
import request from '@/lib/request'

import type {
  CreateGachaConfigReqBody,
  DeleteGachaConfigReqBody,
  GachaConfig,
  GetGachaConfigListReqParams,
  GetGachaRecordListReqParams,
  GetGachaRecordListResData,
  ImportGachaReqBody,
  ImportGachaResData,
  UpdateGachaConfigReqBody
} from './types'

/** 祈愿相关接口路径（/private-api/v1） */
const PRIVATE_GACHA_API = {
  CONFIG_LIST: '/private-api/v1/gacha/config/list',
  CONFIG_CREATE: '/private-api/v1/gacha/config/create',
  CONFIG_UPDATE: '/private-api/v1/gacha/config/update',
  CONFIG_DELETE: '/private-api/v1/gacha/config/delete',
  IMPORT: '/private-api/v1/gacha/import',
  RECORD_LIST: '/private-api/v1/gacha/record/list'
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

/**
 * 导入祈愿记录（JSON文件）
 * @param body 包含file、game_type、gacha_config_id
 * @param onUploadProgress 上传进度回调
 */
export function pr_v1_gacha_import(body: ImportGachaReqBody, onUploadProgress?: (progress: number) => void) {
  const formData = new FormData()
  formData.append('file', body.file)
  formData.append('game_type', body.game_type)
  formData.append('gacha_config_id', body.gacha_config_id)

  const config: AxiosRequestConfig = {
    url: PRIVATE_GACHA_API.IMPORT,
    data: formData,
    method: RequestMethodEnum.POST,
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onUploadProgress(progress)
      }
    }
  }

  return request<ImportGachaResData>(config)
}

/** 获取祈愿记录列表（按gacha_type分组） */
export function pr_v1_gacha_record_list(params: GetGachaRecordListReqParams) {
  return Get<GetGachaRecordListResData>(PRIVATE_GACHA_API.RECORD_LIST, params)
}
