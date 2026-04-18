import { computed, onMounted, onUnmounted, type Ref, ref, watch } from 'vue'

import type { CaptchaType } from '@/definitions/types/captcha.types'

const STORAGE_PREFIX = 'arona:captcha-send:'
const DEFAULT_COOLDOWN_MS = 60_000

export interface CaptchaSendRecord {
  cache_id: string
  type: CaptchaType
  /** 发送冷却结束时间（unix ms） */
  cooldownEndsAt: number
  /** 服务端 cache 过期（unix ms，可选） */
  expire?: number
}

function storageKey(type: CaptchaType, identifier: string) {
  return `${STORAGE_PREFIX}${type}:${identifier}`
}

/** 将服务端 expire 规范为 unix 毫秒 */
export function normalizeServerExpireMs(expire?: number): number | undefined {
  if (expire === undefined || Number.isNaN(expire)) return undefined
  return expire < 1e12 ? expire * 1000 : expire
}

export function useCaptchaSendCooldown(type: CaptchaType, identifierRef: Ref<string>) {
  const remainingSec = ref(0)
  let intervalId: ReturnType<typeof setInterval> | undefined

  function readRecord(): CaptchaSendRecord | null {
    const id = identifierRef.value.trim()
    if (!id) return null
    try {
      const raw = localStorage.getItem(storageKey(type, id))
      if (!raw) return null
      return JSON.parse(raw) as CaptchaSendRecord
    } catch {
      return null
    }
  }

  function writeRecord(record: CaptchaSendRecord) {
    const id = identifierRef.value.trim()
    if (!id) return
    localStorage.setItem(storageKey(type, id), JSON.stringify(record))
  }

  function syncRemaining() {
    const rec = readRecord()
    if (!rec) {
      remainingSec.value = 0
      return
    }
    const leftMs = rec.cooldownEndsAt - Date.now()
    remainingSec.value = Math.max(0, Math.ceil(leftMs / 1000))
  }

  function getCacheId(): string | null {
    const rec = readRecord()
    if (!rec?.cache_id) return null
    if (typeof rec.expire === 'number' && Date.now() > rec.expire) {
      return null
    }
    return rec.cache_id
  }

  function onSendSuccess(cache_id: string, expire?: number) {
    writeRecord({
      cache_id,
      type,
      cooldownEndsAt: Date.now() + DEFAULT_COOLDOWN_MS,
      expire
    })
    syncRemaining()
  }

  onMounted(() => {
    syncRemaining()
    intervalId = setInterval(syncRemaining, 1000)
  })

  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
  })

  watch(identifierRef, () => {
    syncRemaining()
  })

  const sendingLocked = computed(() => remainingSec.value > 0)

  return {
    remainingSec,
    sendingLocked,
    getCacheId,
    onSendSuccess,
    readRecord
  }
}
