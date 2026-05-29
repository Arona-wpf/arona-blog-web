/** 通用接口响应体结构 */
export interface ResponseBody<T = any> {
  /** 响应状态码 */
  code: number
  /** 响应消息 */
  msg: string
  /** 可选的重定向地址 */
  redirect?: string
  /** 业务数据载荷 */
  data: T
}
