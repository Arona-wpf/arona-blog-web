import {
  type GameType,
  GameTypeEnum,
  GenshinImpactServerRegionEnum,
  HonkaiStarRailServerRegionEnum,
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
