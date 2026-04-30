<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const { t } = useI18n()
const { copy } = useClipboard()

// 当前时间戳（实时更新）
const currentTimestamp = ref(Date.now())
const currentTimestampSeconds = computed(() => Math.floor(currentTimestamp.value / 1000))

// 当前北京时间字符串
const currentDatetime = computed(() => {
  const date = new Date(currentTimestamp.value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
})

// 更新当前时间戳
const interval = ref<ReturnType<typeof setInterval> | null>(null)
function startTimer() {
  interval.value = setInterval(() => {
    currentTimestamp.value = Date.now()
  }, 1000)
}
startTimer()

// 时间戳类型：10位（秒）或13位（毫秒）
const timestampType = ref<'seconds' | 'milliseconds'>('seconds')

// 输入的时间戳
const timestampInput = ref<string>('')

// 输入的北京时间
const datetimeInput = ref<string>('')

// 转换结果
const convertedDatetime = ref<string>('')
const convertedTimestamp = ref<string>('')

// 自动检测时间戳类型
function detectTimestampType(timestamp: string): 'seconds' | 'milliseconds' | null {
  const num = parseInt(timestamp, 10)
  if (isNaN(num)) return null
  // 10位时间戳：大约在 1e9 到 2e9 范围（1970-2033年）
  // 13位时间戳：大约在 1e12 到 2e12 范围
  if (num >= 1e12 && num < 2e13) return 'milliseconds'
  if (num >= 1e8 && num < 2e9) return 'seconds'
  // 根据长度判断
  if (timestamp.length === 13) return 'milliseconds'
  if (timestamp.length === 10) return 'seconds'
  return null
}

// 时间戳转北京时间
function timestampToDatetime(timestamp: string): string {
  const num = parseInt(timestamp, 10)
  if (isNaN(num)) return ''

  // 自动检测类型
  const detectedType = detectTimestampType(timestamp)
  let ms = num
  if (detectedType === 'seconds') {
    ms = num * 1000
  }

  const date = new Date(ms)
  // 北京时间 = UTC+8
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 北京时间转时间戳
function datetimeToTimestamp(datetime: string, type: 'seconds' | 'milliseconds'): string {
  if (!datetime) return ''

  const date = new Date(datetime)
  if (isNaN(date.getTime())) return ''

  const ms = date.getTime()
  return type === 'seconds' ? String(Math.floor(ms / 1000)) : String(ms)
}

// 监听时间戳输入变化
watch(timestampInput, (value) => {
  if (value) {
    convertedDatetime.value = timestampToDatetime(value)
  } else {
    convertedDatetime.value = ''
  }
})

// 监听北京时间输入变化
watch(datetimeInput, (value) => {
  if (value) {
    convertedTimestamp.value = datetimeToTimestamp(value, timestampType.value)
  } else {
    convertedTimestamp.value = ''
  }
})

// 监听时间戳类型变化（重新计算）
watch(timestampType, () => {
  if (datetimeInput.value) {
    convertedTimestamp.value = datetimeToTimestamp(datetimeInput.value, timestampType.value)
  }
})

// 复制功能
function copyTimestamp(type: 'current' | 'input' | 'converted', format?: 'seconds' | 'milliseconds') {
  let text = ''
  if (type === 'current') {
    text = format === 'seconds' ? String(currentTimestampSeconds.value) : String(currentTimestamp.value)
  } else if (type === 'input') {
    text = timestampInput.value
  } else {
    text = convertedTimestamp.value
  }
  if (!text) return
  copy(text).then(() => {
    toast.success(t('views.dev.copySuccess'))
  })
}

function copyDatetime() {
  const text = convertedDatetime.value
  if (!text) return
  copy(text).then(() => {
    toast.success(t('views.dev.copySuccess'))
  })
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.time.timestamp.title') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('views.time.timestamp.description') }}</p>
    </div>

    <!-- 当前时间戳显示 -->
    <div class="space-y-3 p-4 border rounded-lg bg-muted/50">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-muted-foreground text-sm">{{ t('views.time.timestamp.currentDatetime') }}:</span>
          <span class="font-mono text-lg">{{ currentDatetime }}</span>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-muted-foreground text-sm">{{ t('views.time.timestamp.seconds') }}:</span>
          <span class="font-mono text-lg">{{ currentTimestampSeconds }}</span>
          <Button variant="outline" size="sm" @click="copyTimestamp('current', 'seconds')">
            {{ t('views.time.timestamp.copy') }}
          </Button>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-muted-foreground text-sm">{{ t('views.time.timestamp.milliseconds') }}:</span>
          <span class="font-mono text-lg">{{ currentTimestamp }}</span>
          <Button variant="outline" size="sm" @click="copyTimestamp('current', 'milliseconds')">
            {{ t('views.time.timestamp.copy') }}
          </Button>
        </div>
      </div>
    </div>

    <!-- 时间戳转北京时间 -->
    <div class="space-y-4 p-4 border rounded-lg">
      <h2 class="text-sm font-medium">{{ t('views.time.timestamp.timestampToDatetime') }}</h2>
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-2">
          <Input
            v-model="timestampInput"
            type="text"
            class="w-[200px]"
            :placeholder="t('views.time.timestamp.timestampPlaceholder')"
          />
          <Button variant="outline" size="sm" @click="timestampInput = ''">
            {{ t('views.time.timestamp.clear') }}
          </Button>
        </div>
        <div v-if="convertedDatetime" class="flex items-center gap-2">
          <span class="text-muted-foreground text-sm">{{ t('views.time.timestamp.beijingTime') }}:</span>
          <span class="font-mono">{{ convertedDatetime }}</span>
          <Button variant="outline" size="sm" @click="copyDatetime">
            {{ t('views.time.timestamp.copy') }}
          </Button>
        </div>
      </div>
    </div>

    <!-- 北京时间转时间戳 -->
    <div class="space-y-4 p-4 border rounded-lg">
      <h2 class="text-sm font-medium">{{ t('views.time.timestamp.datetimeToTimestamp') }}</h2>
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <Input v-model="datetimeInput" type="datetime-local" class="w-[200px]" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm">{{ t('views.time.timestamp.outputFormat') }}</span>
            <RadioGroup v-model="timestampType" class="flex gap-2">
              <div class="flex items-center gap-1">
                <RadioGroupItem value="seconds" />
                <label class="text-sm cursor-pointer">{{ t('views.time.timestamp.seconds10') }}</label>
              </div>
              <div class="flex items-center gap-1">
                <RadioGroupItem value="milliseconds" />
                <label class="text-sm cursor-pointer">{{ t('views.time.timestamp.milliseconds13') }}</label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <div v-if="convertedTimestamp" class="flex items-center gap-2">
          <span class="text-muted-foreground text-sm">{{ t('views.time.timestamp.result') }}:</span>
          <span class="font-mono">{{ convertedTimestamp }}</span>
          <Button variant="outline" size="sm" @click="copyTimestamp('converted')">
            {{ t('views.time.timestamp.copy') }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
