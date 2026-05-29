import { GenderEnum, LocaleEnum } from '@/definitions/enums/common.enum'

/** 用户性别联合类型（由性别枚举派生） */
export type GenderType = (typeof GenderEnum)[keyof typeof GenderEnum]

/** 站点语言联合类型（由语言枚举派生） */
export type LocaleType = (typeof LocaleEnum)[keyof typeof LocaleEnum]
