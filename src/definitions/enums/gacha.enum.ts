export enum GameTypeEnum {
  GENSHIN_IMPACT = 'genshin_impact',
  HONKAI_STAR_RAIL = 'honkai_star_rail',
  ZENLESS_ZONE_ZERO = 'zenless_zone_zero'
}

export type GameType = (typeof GameTypeEnum)[keyof typeof GameTypeEnum]

export enum GenshinImpactServerRegionEnum {
  CN_GF01 = 'cn_gf01',
  CN_QD01 = 'cn_qd01',
  OS_ASIA = 'os_asia',
  OS_EURO = 'os_euro',
  OS_USA = 'os_usa',
  OS_CHT = 'os_cht'
}

export enum HonkaiStarRailServerRegionEnum {
  PROD_GF_CN = 'prod_gf_cn',
  PROD_QD_CN = 'prod_qd_cn',
  PROD_OFFICIAL_ASIA = 'prod_official_asia',
  PROD_OFFICIAL_EURO = 'prod_official_euro',
  PROD_OFFICIAL_USA = 'prod_official_usa',
  PROD_OFFICIAL_CHT = 'prod_official_cht'
}

export enum ZenlessZoneZeroServerRegionEnum {
  PROD_GF_CN = 'prod_gf_cn',
  PROD_QD_CN = 'prod_qd_cn',
  PROD_OFFICIAL_ASIA = 'prod_official_asia',
  PROD_OFFICIAL_EURO = 'prod_official_euro',
  PROD_OFFICIAL_USA = 'prod_official_usa',
  PROD_OFFICIAL_CHT = 'prod_official_cht'
}
