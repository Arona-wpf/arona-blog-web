import type { GachaItemTypeEnum, GameTypeEnum } from '@/definitions/enums/gacha.enum'
import type { GachaRecord } from '@/fetch/gacha/types'

/** 抽卡系统游戏类型联合类型（由游戏类型枚举派生） */
export type GameType = (typeof GameTypeEnum)[keyof typeof GameTypeEnum]

/** 祈愿物品类型 */
export type GachaItemType = (typeof GachaItemTypeEnum)[keyof typeof GachaItemTypeEnum]

/** 常驻池图鉴配置值 */
export interface GachaAtlasConfigValue {
  character: string[]
  weapon: string[]
}

/** 保底状态类型 */
export type PityStatus = 'small' | 'big' | null

/** 抽卡统计卡片所需的汇总数据 */
export interface IGachaStats {
  /** 总抽数 */
  totalPulls: number
  /** 出金次数 */
  goldCount: number
  /** UP出金次数 */
  upGoldCount: number
  /** 保底出金次数（常驻池角色/武器） */
  pityGoldCount: number
  /** 当前垫抽数（距离下一次出金） */
  pityCount: number
  /** 保底状态：小保底（上一金非常驻）或大保底（上一金是常驻，下次必出UP） */
  pityStatus: PityStatus
  /** 平均每次出金所需抽数 */
  avgPerGold: string
  /** UP平均每次出金所需抽数 */
  upAvgPerGold: string
  /** 出金率 */
  goldRate: string
  /** UP出金率 */
  upGoldRate: string
  /** UP概率（UP金数/总金数） */
  upProbability: string
  /** 最近一次出金记录 */
  lastGold: GachaRecord | null
}

/** 抽卡记录筛选时间范围 */
export interface IGachaTimeRange {
  /** 开始时间戳 */
  start: number
  /** 结束时间戳 */
  end: number
}

/** 单次出金对应的抽数统计 */
export interface IGachaGoldPulls {
  /** 出金对应的祈愿记录 */
  record: GachaRecord
  /** 距离上一次出金累计抽数 */
  pulls: number
}

/** 按祈愿 ID 比较（数值越大表示越新） */
export function compareGachaId(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true })
}
