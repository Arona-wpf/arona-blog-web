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

// 原神祈愿类型
export enum GenshinImpactGachaTypeEnum {
  NOVICE_WISH = '100', // 新手祈愿
  PERMANENT_WISH = '200', // 常驻祈愿
  CHARACTER_EVENT_WISH = '301', // 角色活动祈愿
  WEAPON_EVENT_WISH = '302', // 武器活动祈愿
  CHARACTER_EVENT_WISH_2 = '400', // 角色活动祈愿-2
  CHRONICLED_WISH = '401' // 集录祈愿
}

// 星穹铁道祈愿类型
export enum HonkaiStarRailGachaTypeEnum {
  REGULAR_WARP = '1', // 常驻跃迁
  STARTER_WARP = '2', // 新手跃迁
  CHARACTER_EVENT_WARP = '11', // 角色活动跃迁
  LIGHT_CONE_EVENT_WARP = '12', // 光锥活动跃迁
  CHARACTER_COLLABORATION_WARP = '21', // 角色联动跃迁
  LIGHT_CONE_COLLABORATION_WARP = '22' // 光锥联动跃迁
}

// 绝区零祈愿类型
export enum ZenlessZoneZeroGachaTypeEnum {
  STABLE_CHANNEL = '1', // 常驻频段
  EXCLUSIVE_CHANNEL = '2', // 独家频段
  W_ENGINE_CHANNEL = '3', // 音擎频段
  BANBOO_CHANNEL = '5' // 邦布频段
}
