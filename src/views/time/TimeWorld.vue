<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectViewport } from '@/components/ui/select'

const { t } = useI18n()

// 常用时区列表
const ALL_TIMEZONES = [
  { id: 'UTC', name: 'UTC', offset: 0, city: '协调世界时' },
  { id: 'Asia/Shanghai', name: 'CST', offset: 8, city: '北京' },
  { id: 'Asia/Tokyo', name: 'JST', offset: 9, city: '东京' },
  { id: 'Asia/Hong_Kong', name: 'HKT', offset: 8, city: '香港' },
  { id: 'Asia/Seoul', name: 'KST', offset: 9, city: '首尔' },
  { id: 'Asia/Singapore', name: 'SGT', offset: 8, city: '新加坡' },
  { id: 'Asia/Dubai', name: 'GST', offset: 4, city: '迪拜' },
  { id: 'Asia/Kolkata', name: 'IST', offset: 5.5, city: '新德里' },
  { id: 'Europe/London', name: 'GMT', offset: 0, city: '伦敦' },
  { id: 'Europe/Paris', name: 'CET', offset: 1, city: '巴黎' },
  { id: 'Europe/Berlin', name: 'CET', offset: 1, city: '柏林' },
  { id: 'Europe/Moscow', name: 'MSK', offset: 3, city: '莫斯科' },
  { id: 'America/New_York', name: 'EST', offset: -5, city: '纽约' },
  { id: 'America/Los_Angeles', name: 'PST', offset: -8, city: '洛杉矶' },
  { id: 'America/Chicago', name: 'CST', offset: -6, city: '芝加哥' },
  { id: 'America/Denver', name: 'MST', offset: -7, city: '丹佛' },
  { id: 'America/Toronto', name: 'EST', offset: -5, city: '多伦多' },
  { id: 'America/Vancouver', name: 'PST', offset: -8, city: '温哥华' },
  { id: 'America/Sao_Paulo', name: 'BRT', offset: -3, city: '圣保罗' },
  { id: 'Australia/Sydney', name: 'AEST', offset: 10, city: '悉尼' },
  { id: 'Australia/Melbourne', name: 'AEST', offset: 10, city: '墨尔本' },
  { id: 'Australia/Perth', name: 'AWST', offset: 8, city: '珀斯' },
  { id: 'Pacific/Auckland', name: 'NZST', offset: 12, city: '奥克兰' },
  { id: 'Pacific/Honolulu', name: 'HST', offset: -10, city: ' Honolulu' }
]

// 默认显示的时区
const defaultTimezones = ['Asia/Shanghai', 'Asia/Tokyo', 'Europe/London', 'America/New_York', 'America/Los_Angeles']

// 用户选择的时区（存储在 localStorage）
const selectedTimezoneIds = ref<string[]>([])

// 从 localStorage 加载
function loadFromStorage() {
  const stored = localStorage.getItem('world-clock-timezones')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) {
        // 过滤掉无效的时区 ID（不在 ALL_TIMEZONES 列表中的）
        const validIds = parsed.filter((id) => ALL_TIMEZONES.some((tz) => tz.id === id))
        if (validIds.length > 0) {
          selectedTimezoneIds.value = validIds
          return
        }
      }
    } catch {
      // ignore
    }
  }
  selectedTimezoneIds.value = defaultTimezones
}

// 保存到 localStorage
function saveToStorage() {
  localStorage.setItem('world-clock-timezones', JSON.stringify(selectedTimezoneIds.value))
}

loadFromStorage()

// 当前 UTC 时间（实时更新）
const nowUtc = ref(Date.now())

const interval = ref<ReturnType<typeof setInterval> | null>(null)
function startTimer() {
  interval.value = setInterval(() => {
    nowUtc.value = Date.now()
  }, 1000)
}
startTimer()

onUnmounted(() => {
  if (interval.value) {
    clearInterval(interval.value)
  }
})

// 选中的时区对象
const selectedTimezones = computed(() => {
  return selectedTimezoneIds.value
    .map((id) => ALL_TIMEZONES.find((tz) => tz.id === id))
    .filter((tz): tz is (typeof ALL_TIMEZONES)[0] => tz !== undefined)
})

// 可添加的时区（排除已选中的）
const availableTimezones = computed(() => {
  return ALL_TIMEZONES.filter((tz) => !selectedTimezoneIds.value.includes(tz.id))
})

// 计算某个时区的当前时间
function getTimeForTimezone(offset: number): {
  date: Date
  hours: number
  hoursStr: string
  minutes: string
  seconds: string
  dateStr: string
  weekday: string
} {
  const utcMs = nowUtc.value
  const localMs = utcMs + offset * 3600 * 1000
  const date = new Date(localMs)

  const hoursNum = date.getUTCHours()
  const hoursStr = String(hoursNum).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  const seconds = String(date.getUTCSeconds()).padStart(2, '0')

  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const dateStr = `${year}-${month}-${day}`

  const WEEKDAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'] as const
  const weekdayIndex = date.getUTCDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6
  const weekday = WEEKDAY_NAMES[weekdayIndex]

  return { date, hours: hoursNum, hoursStr, minutes, seconds, dateStr, weekday }
}

// 格式化偏移显示
function formatOffset(offset: number): string {
  const sign = offset >= 0 ? '+' : ''
  const absOffset = Math.abs(offset)
  const hours = Math.floor(absOffset)
  const minutes = (absOffset - hours) * 60

  if (minutes === 0) {
    return `UTC${sign}${hours}`
  }
  return `UTC${sign}${hours}:${String(minutes).padStart(2, '0')}`
}

// 添加时区
function addTimezone(id: unknown) {
  const idStr = String(id)
  if (idStr && idStr !== 'null' && idStr !== 'undefined' && !selectedTimezoneIds.value.includes(idStr)) {
    selectedTimezoneIds.value.push(idStr)
    saveToStorage()
  }
}

// 移除时区
function removeTimezone(id: string) {
  const index = selectedTimezoneIds.value.indexOf(id)
  if (index > -1) {
    selectedTimezoneIds.value.splice(index, 1)
    saveToStorage()
  }
}

// 重置为默认
function resetToDefault() {
  selectedTimezoneIds.value = [...defaultTimezones]
  saveToStorage()
}

// 判断是否是夜间（6点前或18点后）
function isNightTime(hours: number): boolean {
  return hours < 6 || hours >= 18
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.time.world.title') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('views.time.world.description') }}</p>
    </div>

    <!-- 时区卡片列表 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="tz in selectedTimezones"
        :key="tz.id"
        class="p-4 border rounded-lg transition-colors"
        :class="isNightTime(getTimeForTimezone(tz.offset).hours) ? 'bg-slate-900/50' : 'bg-muted/50'"
      >
        <div class="flex items-start justify-between mb-2">
          <div>
            <div class="font-medium">{{ tz.city }}</div>
            <div class="text-muted-foreground text-xs">{{ tz.name }} · {{ formatOffset(tz.offset) }}</div>
          </div>
          <Button variant="outline" size="sm" class="h-6 px-2" @click="removeTimezone(tz.id)"> ✕ </Button>
        </div>
        <div class="flex items-baseline gap-1">
          <span class="font-mono text-3xl tabular-nums">
            {{ getTimeForTimezone(tz.offset).hoursStr }}
          </span>
          <span class="text-muted-foreground">:</span>
          <span class="font-mono text-3xl tabular-nums">
            {{ getTimeForTimezone(tz.offset).minutes }}
          </span>
          <span class="text-muted-foreground text-lg tabular-nums"> :{{ getTimeForTimezone(tz.offset).seconds }} </span>
        </div>
        <div class="text-muted-foreground text-sm mt-1">
          {{ getTimeForTimezone(tz.offset).dateStr }} {{ getTimeForTimezone(tz.offset).weekday }}
        </div>
      </div>
    </div>

    <!-- 添加时区 -->
    <div class="flex flex-wrap items-center gap-4 p-4 border rounded-lg">
      <span class="text-sm font-medium">{{ t('views.time.world.addTimezone') }}</span>
      <Select @update:model-value="addTimezone">
        <SelectTrigger class="w-[200px]">
          <SelectValue :placeholder="t('views.time.world.selectTimezone')" />
        </SelectTrigger>
        <SelectContent>
          <SelectViewport>
            <SelectItem v-for="tz in availableTimezones" :key="tz.id" :value="tz.id">
              {{ tz.city }} ({{ formatOffset(tz.offset) }})
            </SelectItem>
          </SelectViewport>
        </SelectContent>
      </Select>
      <Button variant="outline" size="sm" @click="resetToDefault">
        {{ t('views.time.world.resetDefault') }}
      </Button>
    </div>

    <!-- 当前 UTC 时间 -->
    <div class="text-muted-foreground text-xs">
      {{ t('views.time.world.currentUtc') }}: {{ new Date(nowUtc).toISOString().slice(0, 19).replace('T', ' ') }} UTC
    </div>
  </div>
</template>
