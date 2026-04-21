import type { FileTypeEnum } from '@/definitions/enums/file.enum'

export type FileType = FileTypeEnum[keyof FileTypeEnum]
