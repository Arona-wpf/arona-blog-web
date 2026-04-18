export interface ResponseBody<T = any> {
  code: number
  msg: string
  redirect?: string
  data: T
}
