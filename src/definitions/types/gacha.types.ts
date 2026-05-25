import type { GameTypeEnum } from '@/definitions/enums/gacha.enum'

export type GameType = (typeof GameTypeEnum)[keyof typeof GameTypeEnum]
