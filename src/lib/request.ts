import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { cloneDeep } from 'lodash'
import { nanoid } from 'nanoid'
import { sm3 } from 'sm-crypto'
import { toast } from 'vue-sonner'

import {
  HTTP_BASE_URL,
  HTTP_CACHE_MAP,
  HTTP_TIMEOUT,
  REQUEST_INTERVAL,
  STORAGE_DURATION,
  URL_REQUEST_CACHE_MAP
} from '@/definitions/constants/request.constants'
import { ResponseCodeEnum } from '@/definitions/enums/request.enums'
import type { ResponseBody } from '@/definitions/types/request.types'
import { sleep } from '@/lib/utils'
import router from '@/plugins/router'

const httpErrorBody: ResponseBody = {
  code: ResponseCodeEnum.NETWORK_ERROR,
  msg: 'Request failed',
  data: null
}

// 请求前判断http缓存
const httpCacheBeforRequest = async (url: string, paramsOrData: Record<string, any>, timer: number, lock: string) => {
  // 1.判断短时间是否有相同url请求
  const urlRequestCache = URL_REQUEST_CACHE_MAP.get(url)
  if (urlRequestCache && timer - urlRequestCache.timer < REQUEST_INTERVAL && urlRequestCache.lock !== lock) {
    // 存在相同url请求， 延时duration毫秒执行
    await sleep(REQUEST_INTERVAL)
  }

  // 2.判断是否有请求缓存
  const hashKey = dealHttpHash(url, paramsOrData)
  const httpCache = HTTP_CACHE_MAP.get(hashKey)
  if (httpCache) {
    const resData = await httpCache
    return {
      hasData: true,
      resData
    }
  }

  return {
    hasData: false
  }
}

// 设置httpCacheMap
const setHttpCacheMap = (url: string, params: Record<string, any>, httpCache: Promise<any>) => {
  const hash = dealHttpHash(url, params)
  HTTP_CACHE_MAP.set(hash, httpCache)

  // 过期自动删除
  setTimeout(() => {
    HTTP_CACHE_MAP.delete(hash)
  }, STORAGE_DURATION)
}

// 设置urlRequestCacheMap
const setUrlRequestCacheMap = (url: string, timer: number, lock: string) => {
  if (!URL_REQUEST_CACHE_MAP.has(url)) {
    URL_REQUEST_CACHE_MAP.set(url, { timer, lock })
    setTimeout(() => {
      URL_REQUEST_CACHE_MAP.delete(url)
    }, REQUEST_INTERVAL + 100)
  }
}

const dealHttpHash = (url: string, params: Record<string, any>) => {
  const paramsSort = params
    ? Object.keys(params)
        .sort()
        .reduce((acc, key) => ({ ...acc, [key]: params[key] }), {})
    : ''
  const paramsStr = JSON.stringify(paramsSort)
  // key为 url + ;; + params排序后JSON串
  const str = url + ';;' + paramsStr
  const hash = sm3(str)
  return hash
}

// axios请求实例
const instance = axios.create({
  baseURL: HTTP_BASE_URL,
  timeout: HTTP_TIMEOUT
})

/**
 * 请求拦截器
 */
instance.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    console.error('request config set error: ', error)
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 */
instance.interceptors.response.use(
  (response: AxiosResponse<ResponseBody>) => {
    const { data } = response
    const { redirect } = data
    // redirect 字段为后端发出的重定向指令
    if (redirect) {
      router.push(redirect)
    }
    if (data?.code !== ResponseCodeEnum.SUCCESS) {
      toast.error(data.msg)
    }
    return response
  },
  (error) => {
    console.error('response error:', error.response?.data?.msg || error.message)
    toast.error(error.response?.data?.msg || error.message)
  }
)

/**
 * 发送请求
 * @param config 请求参数
 * @returns 响应结果
 */
export default async function request<T = any>(config: AxiosRequestConfig): Promise<ResponseBody<T>> {
  const conf: AxiosRequestConfig = cloneDeep(config)

  const { url, data, params } = config
  const timer = Date.now()
  const lock = nanoid()

  // GET 请求使用 params，POST/PUT 等使用 data
  const paramsOrData = params || data

  // 设置延时缓存
  setUrlRequestCacheMap(url!, timer, lock)
  const { hasData, resData } = await httpCacheBeforRequest(url!, paramsOrData, timer, lock)
  if (hasData) {
    return resData
  }
  const func = new Promise<ResponseBody<T>>((resolve, reject) => {
    instance
      .request<ResponseBody<T>, AxiosResponse<ResponseBody<T>>>(conf)
      .then((res: AxiosResponse<ResponseBody<T>>) => {
        resolve(res?.data || httpErrorBody)
      })
      .catch((err: AxiosError) => {
        reject(err)
      })
  })
  setHttpCacheMap(url!, paramsOrData, func)
  return await func
}
