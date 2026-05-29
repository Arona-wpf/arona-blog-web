import type { FileTypeEnum } from '@/definitions/enums/file.enum'

/** 上传资源类型联合类型（由资源类型枚举派生） */
export type FileType = FileTypeEnum[keyof FileTypeEnum]
