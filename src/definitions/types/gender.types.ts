import { GenderEnum } from '@/definitions/enums/gender.enum'

/** 注册场景使用的性别联合类型（由性别枚举派生） */
export type Gender = (typeof GenderEnum)[keyof typeof GenderEnum]
