import { toast } from 'vue-sonner'

import type { LogTypeEnum } from '@/fetch/log/types'
import i18n from '@/plugins/i18n'

const t = i18n.global.t

/**
 * 日志 WebSocket 事件类型
 */
export interface LogWsEvent {
  event: string
  data: unknown
}

/**
 * 日志订阅确认事件数据
 */
export interface LogSubscribedData {
  type: LogTypeEnum
  filename: string
  message: string
}

/**
 * 日志初始化事件数据
 */
export interface LogInitData {
  type: LogTypeEnum
  lines: string[]
  totalLines: number
}

/**
 * 日志更新事件数据
 */
export interface LogUpdateData {
  type: LogTypeEnum
  lines: string[]
}

/**
 * 日志 WebSocket 服务
 * 用于实时订阅和接收日志推送
 */
class LogWebSocketService {
  private ws: WebSocket | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private intentionalDisconnect = false

  // 事件回调
  private onSubscribedCallback: ((data: LogSubscribedData) => void) | null = null
  private onInitCallback: ((data: LogInitData) => void) | null = null
  private onUpdateCallback: ((data: LogUpdateData) => void) | null = null
  private onUnsubscribedCallback: ((type: LogTypeEnum) => void) | null = null
  private onErrorCallback: ((message: string) => void) | null = null

  /** WebSocket 连接状态 */
  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN
  }

  /** 建立 WebSocket 连接 */
  connect() {
    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
      console.log('[LogWS] Already connected')
      return
    }

    // 构建 WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    const wsUrl = `${protocol}//${host}/ws/log`

    this.ws = new WebSocket(wsUrl)

    this.ws.onopen = () => {
      console.log('[LogWS] Connected')
      this.reconnectAttempts = 0
      this.intentionalDisconnect = false
    }

    this.ws.onclose = (event) => {
      console.log('[LogWS] Disconnected', event.code, event.reason)
      this.ws = null
      if (this.intentionalDisconnect) return
      if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
        toast.warning(t('views.log.ws.disconnected'))
        this.scheduleReconnect()
      } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        toast.error(t('views.log.ws.reconnectFailed'))
      }
    }

    this.ws.onerror = (error) => {
      console.error('[LogWS] Error:', error)
      if (this.onErrorCallback) {
        this.onErrorCallback('WebSocket connection error')
      }
    }

    this.ws.onmessage = (event) => {
      this.handleMessage(event.data)
    }
  }

  /** 断开 WebSocket 连接 */
  disconnect() {
    this.intentionalDisconnect = true
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.reconnectAttempts = this.maxReconnectAttempts
    if (this.ws) {
      this.ws.close(1000, 'User disconnect')
      this.ws = null
    }
    // 清除回调
    this.onSubscribedCallback = null
    this.onInitCallback = null
    this.onUpdateCallback = null
    this.onUnsubscribedCallback = null
    this.onErrorCallback = null
  }

  /** 发送消息 */
  private send(event: string, data: unknown) {
    if (this.isConnected) {
      this.ws!.send(JSON.stringify({ event, data }))
    } else {
      console.warn('[LogWS] Not connected, cannot send message')
    }
  }

  /** 处理接收的消息 */
  private handleMessage(data: string) {
    try {
      const message: LogWsEvent = JSON.parse(data)
      const { event, data: eventData } = message

      switch (event) {
        case 'log:subscribed':
          if (this.onSubscribedCallback) {
            this.onSubscribedCallback(eventData as LogSubscribedData)
          }
          break
        case 'log:init':
          if (this.onInitCallback) {
            this.onInitCallback(eventData as LogInitData)
          }
          break
        case 'log:update':
          if (this.onUpdateCallback) {
            this.onUpdateCallback(eventData as LogUpdateData)
          }
          break
        case 'log:unsubscribed':
          if (this.onUnsubscribedCallback) {
            this.onUnsubscribedCallback((eventData as { type: LogTypeEnum }).type)
          }
          break
        case 'log:error':
          if (this.onErrorCallback) {
            this.onErrorCallback((eventData as { message: string }).message)
          }
          break
        default:
          console.log('[LogWS] Unknown event:', event)
      }
    } catch (error) {
      console.error('[LogWS] Failed to parse message:', error)
    }
  }

  /** 安排重连 */
  private scheduleReconnect() {
    if (this.reconnectTimer) return
    this.reconnectAttempts++
    console.log(`[LogWS] Reconnecting in ${this.reconnectDelay}ms (attempt ${this.reconnectAttempts})`)
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, this.reconnectDelay)
  }

  /** 订阅日志 */
  subscribe(type: LogTypeEnum, filename: string) {
    this.send('log:subscribe', { type, filename })
  }

  /** 取消订阅日志 */
  unsubscribe(type: LogTypeEnum) {
    this.send('log:unsubscribe', { type })
  }

  /** 设置订阅确认回调 */
  onSubscribed(callback: (data: LogSubscribedData) => void) {
    this.onSubscribedCallback = callback
  }

  /** 设置初始化回调 */
  onInit(callback: (data: LogInitData) => void) {
    this.onInitCallback = callback
  }

  /** 设置更新回调 */
  onUpdate(callback: (data: LogUpdateData) => void) {
    this.onUpdateCallback = callback
  }

  /** 设置取消订阅回调 */
  onUnsubscribed(callback: (type: LogTypeEnum) => void) {
    this.onUnsubscribedCallback = callback
  }

  /** 设置错误回调 */
  onError(callback: (message: string) => void) {
    this.onErrorCallback = callback
  }
}

export const logWsService = new LogWebSocketService()
