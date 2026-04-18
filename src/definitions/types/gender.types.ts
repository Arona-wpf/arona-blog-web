import { GenderEnum } from '@/definitions/enums/gender.enum'

export type Gender = (typeof GenderEnum)[keyof typeof GenderEnum]
