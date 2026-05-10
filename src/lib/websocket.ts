import { toast } from 'vue-sonner'

import i18n from '@/plugins/i18n'

const t = i18n.global.t

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

  /** WebSocket 连接状态 */
  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN
  }

  /** 建立 WebSocket 连接 */
  connect() {
    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
      console.log('[WebSocket] Already connected')
      return
    }

    // 构建 WebSocket URL（使用当前页面的协议和主机）
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    const wsUrl = `${protocol}//${host}/ws`

    this.ws = new WebSocket(wsUrl)

    this.ws.onopen = () => {
      console.log('[WebSocket] Connected')
      this.reconnectAttempts = 0
      this.intentionalDisconnect = false
    }

    this.ws.onclose = (event) => {
      console.log('[WebSocket] Disconnected', event.code, event.reason)
      this.ws = null
      // 用户主动断开时不提示
      if (this.intentionalDisconnect) return
      // 非正常关闭时尝试重连
      if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
        toast.warning(t('global.ws.disconnected'))
        this.scheduleReconnect()
      } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        toast.error(t('global.ws.reconnectFailed'))
      }
    }

    this.ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error)
    }

    this.ws.onmessage = (event) => {
      console.log('[WebSocket] Message:', event.data)
    }
  }

  /** 断开 WebSocket 连接 */
  disconnect() {
    this.intentionalDisconnect = true
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.reconnectAttempts = this.maxReconnectAttempts // 阻止重连
    if (this.ws) {
      this.ws.close(1000, 'User logout')
      this.ws = null
    }
  }

  /** 发送消息 */
  send(data: unknown) {
    if (this.isConnected) {
      this.ws!.send(JSON.stringify(data))
    } else {
      console.warn('[WebSocket] Not connected, cannot send message')
    }
  }

  /** 安排重连 */
  private scheduleReconnect() {
    if (this.reconnectTimer) return
    this.reconnectAttempts++
    console.log(`[WebSocket] Reconnecting in ${this.reconnectDelay}ms (attempt ${this.reconnectAttempts})`)
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, this.reconnectDelay)
  }
}

export const wsService = new WebSocketService()
