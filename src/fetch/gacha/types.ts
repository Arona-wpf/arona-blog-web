import type { GameType } from '@/definitions/types/gacha.types'

/** 祈愿配置 */
export interface GachaConfig {
  _id: string
  game_type: GameType
  region: string
  game_uid: string
  game_nickname: string
  gacha_url: string
  created_at: number
  updated_at?: number
}

/** 创建祈愿配置请求 */
export interface CreateGachaConfigReqBody {
  game_type: GameType
  region: string
  game_uid: string
  game_nickname: string
  gacha_url: string
}

/** 获取祈愿配置列表请求 */
export interface GetGachaConfigListReqParams {
  game_type?: GameType
}

/** 更新祈愿配置请求 */
export interface UpdateGachaConfigReqBody {
  _id: string
  game_uid?: string
  game_nickname?: string
  gacha_url?: string
}

/** 删除祈愿配置请求 */
export interface DeleteGachaConfigReqBody {
  _id: string
}

/** 导入祈愿记录请求 */
export interface ImportGachaReqBody {
  file: File
  game_type: GameType
  gacha_config_id: string
}

/** 导入祈愿记录响应 */
export interface ImportGachaResData {
  total: number
  imported: number
}

/** 祈愿记录 */
export interface GachaRecord {
  _id: string
  gacha_id: string
  gacha_type: string
  gacha_time: number
  item_id: string
  item_type: string
  item_name: string
  rank_type: string
  icon_url: string
}

/** 获取祈愿记录请求 */
export interface GetGachaRecordListReqParams {
  gacha_config_id: string
}

/** 获取祈愿记录响应（按gacha_type分组） */
export type GetGachaRecordListResData = Record<string, GachaRecord[]>

/** 导出祈愿记录请求 */
export interface ExportGachaReqBody {
  gacha_config_id: string
  file_name: string
  file_type: 'json' | 'excel'
}

/** 导出祈愿记录响应 */
export interface ExportGachaResData {
  url: string
}

/** 同步祈愿记录请求 */
export interface SyncGachaReqBody {
  gacha_config_id: string
  gacha_url: string
}

/** 同步祈愿记录响应 */
export interface SyncGachaResData {
  total: number
  new: number
}
