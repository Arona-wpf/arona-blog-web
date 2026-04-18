import { type AxiosRequestConfig } from 'axios'

import { RequestMethodEnum } from '@/definitions/enums/request.enums'
import type { ResponseBody } from '@/definitions/types/request.types'
import request from '@/lib/request'

/**
 * Get 方法
 * @param url
 * @param params
 * @param config
 * @constructor
 */
export function Get<T = any>(url: string, params?: unknown, config: Omit<AxiosRequestConfig, 'params'> = {}) {
  return request<T>({ url, params, ...config, method: RequestMethodEnum.GET })
}

/**
 * Post 方法
 * @param url
 * @param data
 * @param config
 * @constructor
 */
export function Post<T = any>(url: string, data?: unknown, config: AxiosRequestConfig = {}) {
  return request<T>({ url, data, ...config, method: RequestMethodEnum.POST })
}

/**
 * Put 方法
 * @param url
 * @param data
 * @param config
 * @constructor
 */
export function Put<T = any>(url: string, data?: unknown, config: AxiosRequestConfig = {}) {
  return request<T>({ url, data, ...config, method: RequestMethodEnum.PUT })
}

/**
 * Delete 方法
 * @param url
 * @param params
 * @param config 理论上可传 data，但是不建议
 * @constructor
 */
export function Delete<T = any, R = ResponseBody<T>>(
  url: string,
  params?: T,
  config: Omit<AxiosRequestConfig, 'params'> = {}
) {
  return request<R>({ url, params, ...config, method: RequestMethodEnum.DELETE })
}
