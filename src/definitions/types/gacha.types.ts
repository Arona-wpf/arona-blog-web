import type { GameTypeEnum } from '@/definitions/enums/gacha.enum'
import type { GachaRecord } from '@/fetch/gacha/types'

export type GameType = (typeof GameTypeEnum)[keyof typeof GameTypeEnum]

export interface IGachaStats {
  totalPulls: number // 总抽数
  goldCount: number // 出金数
  pityCount: number // 已垫抽数
  avgPerGold: string // 平均每金
  goldRate: string // 出金率
  lastGold: GachaRecord | null // 最近出金
}

export interface IGachaTimeRange {
  start: number // 开始时间
  end: number // 结束时间
}

export interface IGachaGoldPulls {
  record: GachaRecord // 祈愿记录
  pulls: number // 抽数
}
