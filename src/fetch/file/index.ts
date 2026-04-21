import { Post } from '@/fetch'

import type { UploadFileResData } from './types'

const PRIVATE_FILE_API = {
  UPLOAD: '/private-api/v1/file/upload'
} as const

export interface UploadFileReqBody {
  file: File
  type: 'image' | 'file'
}

/**
 * 上传文件
 */
export function pr_v1_file_upload(body: UploadFileReqBody) {
  const formData = new FormData()
  formData.append('file', body.file)
  formData.append('type', body.type)
  return Post<UploadFileResData>(PRIVATE_FILE_API.UPLOAD, formData)
}
