import {
  type GameType,
  GameTypeEnum,
  GenshinImpactGachaTypeEnum,
  GenshinImpactServerRegionEnum,
  HonkaiStarRailGachaTypeEnum,
  HonkaiStarRailServerRegionEnum,
  ZenlessZoneZeroGachaTypeEnum,
  ZenlessZoneZeroServerRegionEnum
} from '@/definitions/enums/gacha.enum'

export const SERVER_REGION_I18N_KEY_MAP: Record<GameType, Record<string, string>> = {
  [GameTypeEnum.GENSHIN_IMPACT]: {
    [GenshinImpactServerRegionEnum.CN_GF01]: 'gacha.region.cn_gf01',
    [GenshinImpactServerRegionEnum.CN_QD01]: 'gacha.region.cn_qd01',
    [GenshinImpactServerRegionEnum.OS_ASIA]: 'gacha.region.os_asia',
    [GenshinImpactServerRegionEnum.OS_EURO]: 'gacha.region.os_euro',
    [GenshinImpactServerRegionEnum.OS_USA]: 'gacha.region.os_usa',
    [GenshinImpactServerRegionEnum.OS_CHT]: 'gacha.region.os_cht'
  },
  [GameTypeEnum.HONKAI_STAR_RAIL]: {
    [HonkaiStarRailServerRegionEnum.PROD_GF_CN]: 'gacha.region.prod_gf_cn',
    [HonkaiStarRailServerRegionEnum.PROD_QD_CN]: 'gacha.region.prod_qd_cn',
    [HonkaiStarRailServerRegionEnum.PROD_OFFICIAL_ASIA]: 'gacha.region.prod_official_asia',
    [HonkaiStarRailServerRegionEnum.PROD_OFFICIAL_EURO]: 'gacha.region.prod_official_euro',
    [HonkaiStarRailServerRegionEnum.PROD_OFFICIAL_USA]: 'gacha.region.prod_official_usa',
    [HonkaiStarRailServerRegionEnum.PROD_OFFICIAL_CHT]: 'gacha.region.prod_official_cht'
  },
  [GameTypeEnum.ZENLESS_ZONE_ZERO]: {
    [ZenlessZoneZeroServerRegionEnum.PROD_GF_CN]: 'gacha.region.prod_gf_cn',
    [ZenlessZoneZeroServerRegionEnum.PROD_QD_CN]: 'gacha.region.prod_qd_cn',
    [ZenlessZoneZeroServerRegionEnum.PROD_OFFICIAL_ASIA]: 'gacha.region.prod_official_asia',
    [ZenlessZoneZeroServerRegionEnum.PROD_OFFICIAL_EURO]: 'gacha.region.prod_official_euro',
    [ZenlessZoneZeroServerRegionEnum.PROD_OFFICIAL_USA]: 'gacha.region.prod_official_usa',
    [ZenlessZoneZeroServerRegionEnum.PROD_OFFICIAL_CHT]: 'gacha.region.prod_official_cht'
  }
}

export const DEFAULT_SERVER_REGION_MAP: Record<GameType, string> = {
  [GameTypeEnum.GENSHIN_IMPACT]: GenshinImpactServerRegionEnum.CN_GF01,
  [GameTypeEnum.HONKAI_STAR_RAIL]: HonkaiStarRailServerRegionEnum.PROD_GF_CN,
  [GameTypeEnum.ZENLESS_ZONE_ZERO]: ZenlessZoneZeroServerRegionEnum.PROD_GF_CN
}

// 祈愿类型国际化Key映射
export const GACHA_TYPE_I18N_KEY_MAP: Record<GameType, Record<string, string>> = {
  [GameTypeEnum.GENSHIN_IMPACT]: {
    [GenshinImpactGachaTypeEnum.NOVICE_WISH]: 'gacha.type.genshin_impact.novice_wish',
    [GenshinImpactGachaTypeEnum.PERMANENT_WISH]: 'gacha.type.genshin_impact.permanent_wish',
    [GenshinImpactGachaTypeEnum.CHARACTER_EVENT_WISH]: 'gacha.type.genshin_impact.character_event_wish',
    [GenshinImpactGachaTypeEnum.WEAPON_EVENT_WISH]: 'gacha.type.genshin_impact.weapon_event_wish',
    [GenshinImpactGachaTypeEnum.CHARACTER_EVENT_WISH_2]: 'gacha.type.genshin_impact.character_event_wish_2',
    [GenshinImpactGachaTypeEnum.CHRONICLED_WISH]: 'gacha.type.genshin_impact.chronicled_wish'
  },
  [GameTypeEnum.HONKAI_STAR_RAIL]: {
    [HonkaiStarRailGachaTypeEnum.REGULAR_WARP]: 'gacha.type.honkai_star_rail.regular_warp',
    [HonkaiStarRailGachaTypeEnum.STARTER_WARP]: 'gacha.type.honkai_star_rail.starter_warp',
    [HonkaiStarRailGachaTypeEnum.CHARACTER_EVENT_WARP]: 'gacha.type.honkai_star_rail.character_event_warp',
    [HonkaiStarRailGachaTypeEnum.LIGHT_CONE_EVENT_WARP]: 'gacha.type.honkai_star_rail.light_cone_event_warp',
    [HonkaiStarRailGachaTypeEnum.CHARACTER_COLLABORATION_WARP]:
      'gacha.type.honkai_star_rail.character_collaboration_warp',
    [HonkaiStarRailGachaTypeEnum.LIGHT_CONE_COLLABORATION_WARP]:
      'gacha.type.honkai_star_rail.light_cone_collaboration_warp'
  },
  [GameTypeEnum.ZENLESS_ZONE_ZERO]: {
    [ZenlessZoneZeroGachaTypeEnum.STABLE_CHANNEL]: 'gacha.type.zenless_zone_zero.stable_channel',
    [ZenlessZoneZeroGachaTypeEnum.EXCLUSIVE_CHANNEL]: 'gacha.type.zenless_zone_zero.exclusive_channel',
    [ZenlessZoneZeroGachaTypeEnum.W_ENGINE_CHANNEL]: 'gacha.type.zenless_zone_zero.w_engine_channel',
    [ZenlessZoneZeroGachaTypeEnum.BANBOO_CHANNEL]: 'gacha.type.zenless_zone_zero.banboo_channel'
  }
}

// 原神祈愿池分组（用于统计卡片）
export const GENSHIN_GACHA_POOL_GROUP = {
  CHARACTER_EVENT: [GenshinImpactGachaTypeEnum.CHARACTER_EVENT_WISH, GenshinImpactGachaTypeEnum.CHARACTER_EVENT_WISH_2],
  WEAPON_EVENT: [GenshinImpactGachaTypeEnum.WEAPON_EVENT_WISH],
  PERMANENT: [GenshinImpactGachaTypeEnum.PERMANENT_WISH],
  NOVICE: [GenshinImpactGachaTypeEnum.NOVICE_WISH],
  CHRONICLED: [GenshinImpactGachaTypeEnum.CHRONICLED_WISH]
}

// 星穹铁道跃迁池分组（用于统计卡片）
export const STARRAIL_GACHA_POOL_GROUP = {
  CHARACTER_EVENT: [HonkaiStarRailGachaTypeEnum.CHARACTER_EVENT_WARP],
  LIGHT_CONE_EVENT: [HonkaiStarRailGachaTypeEnum.LIGHT_CONE_EVENT_WARP],
  PERMANENT: [HonkaiStarRailGachaTypeEnum.REGULAR_WARP],
  STARTER: [HonkaiStarRailGachaTypeEnum.STARTER_WARP]
}

// 绝区零频段分组（用于统计卡片）
export const ZZZ_GACHA_POOL_GROUP = {
  EXCLUSIVE_CHANNEL: [ZenlessZoneZeroGachaTypeEnum.EXCLUSIVE_CHANNEL],
  W_ENGINE_CHANNEL: [ZenlessZoneZeroGachaTypeEnum.W_ENGINE_CHANNEL],
  BANBOO_CHANNEL: [ZenlessZoneZeroGachaTypeEnum.BANBOO_CHANNEL],
  STABLE_CHANNEL: [ZenlessZoneZeroGachaTypeEnum.STABLE_CHANNEL]
}

// 每抽消耗货币数量（各游戏统一为160）
export const GACHA_COST_PER_PULL: Record<GameType, number> = {
  [GameTypeEnum.GENSHIN_IMPACT]: 160,
  [GameTypeEnum.HONKAI_STAR_RAIL]: 160,
  [GameTypeEnum.ZENLESS_ZONE_ZERO]: 160
}
