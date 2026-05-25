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
