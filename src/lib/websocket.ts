import { ref, watch } from 'vue'
import { toast } from 'vue-sonner'

import type { LogTypeEnum } from '@/fetch/log/types'
import i18n from '@/plugins/i18n'

const t = i18n.global.t

// 监听 locale 变化，自动更新 WebSocket
watch(
  () => i18n.global.locale,
  (newLocale) => {
    if (wsService.connected.value) {
      wsService.updateLocale(newLocale)
    }
  }
)

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
 * WebSocket 连接管理服务
 */
class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private intentionalDisconnect = false

  // 待发送的订阅请求（连接建立后发送）
  private pendingLogSubscribe: { type: LogTypeEnum; filename: string } | null = null

  // 响应式状态
  public connected = ref(false)
  public logSubscribed = ref(false)

  // 日志相关回调
  private onLogSubscribedCallback: ((data: LogSubscribedData) => void) | null = null
  private onLogInitCallback: ((data: LogInitData) => void) | null = null
  private onLogUpdateCallback: ((data: LogUpdateData) => void) | null = null
  private onLogUnsubscribedCallback: ((type: LogTypeEnum) => void) | null = null
  private onLogErrorCallback: ((message: string) => void) | null = null

  /** 建立 WebSocket 连接 */
  connect() {
    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
      console.log('[WebSocket] Already connected')
      return
    }

    // 构建 WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    const wsUrl = `${protocol}//${host}/ws`

    this.ws = new WebSocket(wsUrl)

    this.ws.onopen = () => {
      console.log('[WebSocket] Connected')
      const wasReconnecting = this.reconnectAttempts > 0
      this.reconnectAttempts = 0
      this.intentionalDisconnect = false
      this.connected.value = true

      // 重连成功提示
      if (wasReconnecting) {
        toast.success(t('global.ws.reconnected'))
      }

      // 发送待处理的日志订阅请求
      if (this.pendingLogSubscribe) {
        this.send('log:subscribe', this.pendingLogSubscribe)
        this.pendingLogSubscribe = null
      }
    }

    this.ws.onclose = (event) => {
      console.log('[WebSocket] Disconnected', event.code, event.reason)
      this.ws = null
      this.connected.value = false
      this.logSubscribed.value = false
      if (this.intentionalDisconnect) return
      if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect()
      } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        toast.error(t('global.ws.reconnectFailed'))
      }
    }

    this.ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error)
    }

    this.ws.onmessage = (event) => {
      this.handleMessage(event.data)
    }
  }

  /** 断开 WebSocket 连接 */
  disconnect() {
    this.intentionalDisconnect = true
    this.pendingLogSubscribe = null
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.reconnectAttempts = this.maxReconnectAttempts
    if (this.ws) {
      this.ws.close(1000, 'User logout')
      this.ws = null
    }
    this.connected.value = false
    this.logSubscribed.value = false
    // 清除回调
    this.onLogSubscribedCallback = null
    this.onLogInitCallback = null
    this.onLogUpdateCallback = null
    this.onLogUnsubscribedCallback = null
    this.onLogErrorCallback = null
  }

  /** 发送消息 */
  private send(event: string, data: unknown) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = { event, data }
      console.log('[WebSocket] Sending:', message)
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('[WebSocket] Not connected, cannot send message')
    }
  }

  /** 处理接收的消息 */
  private handleMessage(data: string) {
    console.log('[WebSocket] Received:', data)
    try {
      const message = JSON.parse(data)
      const { event, data: eventData } = message

      switch (event) {
        case 'log:subscribed':
          this.logSubscribed.value = true
          if (this.onLogSubscribedCallback) {
            this.onLogSubscribedCallback(eventData as LogSubscribedData)
          }
          break
        case 'log:init':
          if (this.onLogInitCallback) {
            this.onLogInitCallback(eventData as LogInitData)
          }
          break
        case 'log:update':
          if (this.onLogUpdateCallback) {
            this.onLogUpdateCallback(eventData as LogUpdateData)
          }
          break
        case 'log:unsubscribed':
          this.logSubscribed.value = false
          if (this.onLogUnsubscribedCallback) {
            this.onLogUnsubscribedCallback((eventData as { type: LogTypeEnum }).type)
          }
          break
        case 'log:error':
          if (this.onLogErrorCallback) {
            this.onLogErrorCallback((eventData as { message: string }).message)
          }
          break
        default:
          console.log('[WebSocket] Unknown event:', event, eventData)
      }
    } catch (error) {
      console.error('[WebSocket] Failed to parse message:', error)
    }
  }

  /** 安排重连 */
  private scheduleReconnect() {
    if (this.reconnectTimer) return
    this.reconnectAttempts++
    console.log(`[WebSocket] Reconnecting in ${this.reconnectDelay}ms (attempt ${this.reconnectAttempts})`)
    toast.warning(t('global.ws.reconnecting', { attempt: this.reconnectAttempts }))
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, this.reconnectDelay)
  }

  /** 订阅日志 */
  subscribeLog(type: LogTypeEnum, filename: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send('log:subscribe', { type, filename })
    } else {
      this.pendingLogSubscribe = { type, filename }
      this.connect()
    }
  }

  /** 取消订阅日志 */
  unsubscribeLog(type: LogTypeEnum) {
    this.pendingLogSubscribe = null
    this.send('log:unsubscribe', { type })
  }

  /** 更新 locale */
  updateLocale(locale: string) {
    this.send('locale:update', { locale })
  }

  /** 设置日志订阅确认回调 */
  onLogSubscribed(callback: (data: LogSubscribedData) => void) {
    this.onLogSubscribedCallback = callback
  }

  /** 设置日志初始化回调 */
  onLogInit(callback: (data: LogInitData) => void) {
    this.onLogInitCallback = callback
  }

  /** 设置日志更新回调 */
  onLogUpdate(callback: (data: LogUpdateData) => void) {
    this.onLogUpdateCallback = callback
  }

  /** 设置日志取消订阅回调 */
  onLogUnsubscribed(callback: (type: LogTypeEnum) => void) {
    this.onLogUnsubscribedCallback = callback
  }

  /** 设置日志错误回调 */
  onLogError(callback: (message: string) => void) {
    this.onLogErrorCallback = callback
  }
}

export const wsService = new WebSocketService()
