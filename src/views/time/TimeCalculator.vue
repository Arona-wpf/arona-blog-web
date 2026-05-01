<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { DatePicker, DateTimePicker } from '@/components/ui/date-picker'
import { FormControl, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const { t } = useI18n()
const { copy } = useClipboard()

// ============ 时间差计算 ============
interface DateTimeValue {
  year: number
  month: number
  day: number
  hours: number
  minutes: number
}

const timeDiffStart = ref<DateTimeValue | undefined>()
const timeDiffEnd = ref<DateTimeValue | undefined>()

const timeDiffResult = computed<string | null>(() => {
  if (!timeDiffStart.value || !timeDiffEnd.value) return null

  const startDate = new Date(
    timeDiffStart.value.year,
    timeDiffStart.value.month - 1,
    timeDiffStart.value.day,
    timeDiffStart.value.hours,
    timeDiffStart.value.minutes
  )
  const endDate = new Date(
    timeDiffEnd.value.year,
    timeDiffEnd.value.month - 1,
    timeDiffEnd.value.day,
    timeDiffEnd.value.hours,
    timeDiffEnd.value.minutes
  )

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null

  const diffMs = Math.abs(endDate.getTime() - startDate.getTime())
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffYears = Math.floor(diffDays / 365)

  const daysRemainder = diffDays % 365
  const hoursRemainder = diffHours % 24
  const minutesRemainder = diffMinutes % 60
  const secondsRemainder = diffSeconds % 60

  const parts: string[] = []
  if (diffYears > 0) parts.push(`${diffYears} ${t('views.time.calculator.years')}`)
  if (daysRemainder > 0) parts.push(`${daysRemainder} ${t('views.time.calculator.days')}`)
  if (hoursRemainder > 0) parts.push(`${hoursRemainder} ${t('views.time.calculator.hours')}`)
  if (minutesRemainder > 0) parts.push(`${minutesRemainder} ${t('views.time.calculator.minutes')}`)
  if (secondsRemainder > 0 || parts.length === 0)
    parts.push(`${secondsRemainder} ${t('views.time.calculator.seconds')}`)

  return parts.join(' ')
})

// ============ 天数差计算 ============
interface DateValueSimple {
  year: number
  month: number
  day: number
}

const daysDiffStart = ref<DateValueSimple | undefined>()
const daysDiffEnd = ref<DateValueSimple | undefined>()

const daysDiffResult = computed<string | null>(() => {
  if (!daysDiffStart.value || !daysDiffEnd.value) return null

  const startDate = new Date(daysDiffStart.value.year, daysDiffStart.value.month - 1, daysDiffStart.value.day)
  const endDate = new Date(daysDiffEnd.value.year, daysDiffEnd.value.month - 1, daysDiffEnd.value.day)

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null

  const diffMs = Math.abs(endDate.getTime() - startDate.getTime())
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffYears = Math.floor(diffDays / 365)
  const daysRemainder = diffDays % 365

  const parts: string[] = []
  if (diffYears > 0) parts.push(`${diffYears} ${t('views.time.calculator.years')}`)
  if (daysRemainder > 0) parts.push(`${daysRemainder} ${t('views.time.calculator.days')}`)
  if (parts.length === 0) parts.push(`0 ${t('views.time.calculator.days')}`)

  return parts.join(' ')
})

// ============ 交换时间 ============
function swapTimeDiff() {
  const temp = timeDiffStart.value
  timeDiffStart.value = timeDiffEnd.value
  timeDiffEnd.value = temp
}

function swapDaysDiff() {
  const temp = daysDiffStart.value
  daysDiffStart.value = daysDiffEnd.value
  daysDiffEnd.value = temp
}

// ============ 使用当前时间 ============
function useCurrentTime(field: 'timeDiffStart' | 'timeDiffEnd') {
  const now = new Date()

  const value: DateTimeValue = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    hours: now.getHours(),
    minutes: now.getMinutes()
  }

  if (field === 'timeDiffStart') {
    timeDiffStart.value = value
  } else {
    timeDiffEnd.value = value
  }
}

function useToday(field: 'daysDiffStart' | 'daysDiffEnd') {
  const now = new Date()
  const value: DateValueSimple = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate()
  }

  if (field === 'daysDiffStart') {
    daysDiffStart.value = value
  } else {
    daysDiffEnd.value = value
  }
}

// ============ 时间单位转换 ============
// 基准单位：纳秒 (ns)
const NS_PER_US = 1000 // 微秒
const NS_PER_MS = 1000 * NS_PER_US // 毫秒
const NS_PER_S = 1000 * NS_PER_MS // 秒
const NS_PER_MIN = 60 * NS_PER_S // 分钟
const NS_PER_H = 60 * NS_PER_MIN // 小时
const NS_PER_D = 24 * NS_PER_H // 天
const NS_PER_W = 7 * NS_PER_D // 周
const NS_PER_Y = 365 * NS_PER_D // 年

interface TimeUnitValues {
  years: string
  weeks: string
  days: string
  hours: string
  minutes: string
  seconds: string
  milliseconds: string
  microseconds: string
  nanoseconds: string
}

const timeUnitValues = ref<TimeUnitValues>({
  years: '',
  weeks: '',
  days: '',
  hours: '',
  minutes: '',
  seconds: '',
  milliseconds: '',
  microseconds: '',
  nanoseconds: ''
})

// 当前正在编辑的字段（避免循环更新）
const currentEditingField = ref<keyof TimeUnitValues | null>(null)

// 计算各单位的值（基于纳秒）
function calculateFromNanoseconds(ns: number): TimeUnitValues {
  return {
    years: formatTimeValue(ns / NS_PER_Y),
    weeks: formatTimeValue(ns / NS_PER_W),
    days: formatTimeValue(ns / NS_PER_D),
    hours: formatTimeValue(ns / NS_PER_H),
    minutes: formatTimeValue(ns / NS_PER_MIN),
    seconds: formatTimeValue(ns / NS_PER_S),
    milliseconds: formatTimeValue(ns / NS_PER_MS),
    microseconds: formatTimeValue(ns / NS_PER_US),
    nanoseconds: formatTimeValue(ns)
  }
}

// 将某个单位转换为纳秒
function convertToNanoseconds(value: number, unit: keyof TimeUnitValues): number {
  switch (unit) {
    case 'years':
      return value * NS_PER_Y
    case 'weeks':
      return value * NS_PER_W
    case 'days':
      return value * NS_PER_D
    case 'hours':
      return value * NS_PER_H
    case 'minutes':
      return value * NS_PER_MIN
    case 'seconds':
      return value * NS_PER_S
    case 'milliseconds':
      return value * NS_PER_MS
    case 'microseconds':
      return value * NS_PER_US
    case 'nanoseconds':
      return value
    default:
      return 0
  }
}

// 监听各单位输入变化
function handleTimeUnitInput(unit: keyof TimeUnitValues, value: string | number) {
  currentEditingField.value = unit

  if (value === '' || value === undefined || value === null) {
    // 清空所有字段
    timeUnitValues.value = {
      years: '',
      weeks: '',
      days: '',
      hours: '',
      minutes: '',
      seconds: '',
      milliseconds: '',
      microseconds: '',
      nanoseconds: ''
    }
    currentEditingField.value = null
    return
  }

  const normalizedValue = typeof value === 'number' ? String(value) : value
  const numValue = parseFloat(normalizedValue)
  if (isNaN(numValue) || numValue < 0) {
    currentEditingField.value = null
    return
  }

  const ns = convertToNanoseconds(numValue, unit)
  const calculated = calculateFromNanoseconds(ns)

  // 更新其他字段（保留当前编辑字段的原始输入）
  const keys: (keyof TimeUnitValues)[] = [
    'years',
    'weeks',
    'days',
    'hours',
    'minutes',
    'seconds',
    'milliseconds',
    'microseconds',
    'nanoseconds'
  ]

  for (const key of keys) {
    if (key !== unit) {
      timeUnitValues.value[key] = calculated[key]
    }
  }

  currentEditingField.value = null
}

// 格式化显示值（去除不必要的精度）
function formatTimeValue(value: number): string {
  if (value === 0) return '0'
  // 对于大于1的值，保留合理的小数位数
  if (value >= 1) {
    // 如果是整数，直接显示
    if (Number.isInteger(value)) return String(value)
    // 否则保留最多6位小数
    const formatted = value.toFixed(6)
    // 去除末尾的0
    return parseFloat(formatted).toString()
  }
  // 对于小于1的值，保留更多精度
  return value.toFixed(9).replace(/\.?0+$/, '')
}

// 复制时间单位值
function copyTimeUnitValue(unit: keyof TimeUnitValues) {
  const value = timeUnitValues.value[unit]
  if (!value) return

  copy(formatTimeValue(parseFloat(value))).then(() => {
    toast.success(t('views.dev.copySuccess'))
  })
}

// 清空时间转换
function clearTimeConvert() {
  timeUnitValues.value = {
    years: '',
    weeks: '',
    days: '',
    hours: '',
    minutes: '',
    seconds: '',
    milliseconds: '',
    microseconds: '',
    nanoseconds: ''
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.time.calculator.title') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('views.time.calculator.description') }}</p>
    </div>

    <!-- 时间差计算 -->
    <div class="space-y-4 p-4 border rounded-lg">
      <h2 class="text-sm font-medium">{{ t('views.time.calculator.timeDiff') }}</h2>
      <div class="flex flex-col gap-3">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-sm">{{ t('views.time.calculator.startTime') }}</span>
            <DateTimePicker v-model="timeDiffStart" />
            <Button variant="outline" size="sm" @click="useCurrentTime('timeDiffStart')">
              {{ t('views.time.calculator.now') }}
            </Button>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm">{{ t('views.time.calculator.endTime') }}</span>
            <DateTimePicker v-model="timeDiffEnd" />
            <Button variant="outline" size="sm" @click="useCurrentTime('timeDiffEnd')">
              {{ t('views.time.calculator.now') }}
            </Button>
          </div>
          <Button variant="outline" size="sm" @click="swapTimeDiff">
            {{ t('views.time.calculator.swap') }}
          </Button>
        </div>
        <div v-if="timeDiffResult" class="flex items-center gap-2">
          <span class="text-muted-foreground text-sm">{{ t('views.time.calculator.result') }}:</span>
          <span class="font-mono">{{ timeDiffResult }}</span>
        </div>
      </div>
    </div>

    <!-- 天数差计算 -->
    <div class="space-y-4 p-4 border rounded-lg">
      <h2 class="text-sm font-medium">{{ t('views.time.calculator.daysDiff') }}</h2>
      <div class="flex flex-col gap-3">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-sm">{{ t('views.time.calculator.startDate') }}</span>
            <DatePicker v-model="daysDiffStart" />
            <Button variant="outline" size="sm" @click="useToday('daysDiffStart')">
              {{ t('views.time.calculator.today') }}
            </Button>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm">{{ t('views.time.calculator.endDate') }}</span>
            <DatePicker v-model="daysDiffEnd" />
            <Button variant="outline" size="sm" @click="useToday('daysDiffEnd')">
              {{ t('views.time.calculator.today') }}
            </Button>
          </div>
          <Button variant="outline" size="sm" @click="swapDaysDiff">
            {{ t('views.time.calculator.swap') }}
          </Button>
        </div>
        <div v-if="daysDiffResult" class="flex items-center gap-2">
          <span class="text-muted-foreground text-sm">{{ t('views.time.calculator.result') }}:</span>
          <span class="font-mono">{{ daysDiffResult }}</span>
        </div>
      </div>
    </div>

    <!-- 时间单位转换 -->
    <div class="space-y-4 p-4 border rounded-lg">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-medium">{{ t('views.time.calculator.timeConvert') }}</h2>
        <Button variant="outline" size="sm" @click="clearTimeConvert">
          {{ t('views.time.timestamp.clear') }}
        </Button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <!-- 年 -->
        <div class="grid grid-cols-[auto_1fr_auto] items-center gap-2">
          <FormLabel class="mb-0 text-right shrink-0 pe-2">{{ t('views.time.calculator.years') }}</FormLabel>
          <FormControl>
            <Input
              :model-value="timeUnitValues.years"
              type="number"
              min="0"
              step="any"
              @update:model-value="handleTimeUnitInput('years', $event)"
            />
          </FormControl>
          <Button
            variant="outline"
            size="sm"
            class="shrink-0"
            :disabled="!timeUnitValues.years"
            @click="copyTimeUnitValue('years')"
          >
            {{ t('views.time.timestamp.copy') }}
          </Button>
        </div>
        <!-- 周 -->
        <div class="grid grid-cols-[auto_1fr_auto] items-center gap-2">
          <FormLabel class="mb-0 text-right shrink-0 pe-2">{{ t('views.time.calculator.weeks') }}</FormLabel>
          <FormControl>
            <Input
              :model-value="timeUnitValues.weeks"
              type="number"
              min="0"
              step="any"
              @update:model-value="handleTimeUnitInput('weeks', $event)"
            />
          </FormControl>
          <Button
            variant="outline"
            size="sm"
            class="shrink-0"
            :disabled="!timeUnitValues.weeks"
            @click="copyTimeUnitValue('weeks')"
          >
            {{ t('views.time.timestamp.copy') }}
          </Button>
        </div>
        <!-- 天 -->
        <div class="grid grid-cols-[auto_1fr_auto] items-center gap-2">
          <FormLabel class="mb-0 text-right shrink-0 pe-2">{{ t('views.time.calculator.days') }}</FormLabel>
          <FormControl>
            <Input
              :model-value="timeUnitValues.days"
              type="number"
              min="0"
              step="any"
              @update:model-value="handleTimeUnitInput('days', $event)"
            />
          </FormControl>
          <Button
            variant="outline"
            size="sm"
            class="shrink-0"
            :disabled="!timeUnitValues.days"
            @click="copyTimeUnitValue('days')"
          >
            {{ t('views.time.timestamp.copy') }}
          </Button>
        </div>
        <!-- 时 -->
        <div class="grid grid-cols-[auto_1fr_auto] items-center gap-2">
          <FormLabel class="mb-0 text-right shrink-0 pe-2">{{ t('views.time.calculator.hours') }}</FormLabel>
          <FormControl>
            <Input
              :model-value="timeUnitValues.hours"
              type="number"
              min="0"
              step="any"
              @update:model-value="handleTimeUnitInput('hours', $event)"
            />
          </FormControl>
          <Button
            variant="outline"
            size="sm"
            class="shrink-0"
            :disabled="!timeUnitValues.hours"
            @click="copyTimeUnitValue('hours')"
          >
            {{ t('views.time.timestamp.copy') }}
          </Button>
        </div>
        <!-- 分 -->
        <div class="grid grid-cols-[auto_1fr_auto] items-center gap-2">
          <FormLabel class="mb-0 text-right shrink-0 pe-2">{{ t('views.time.calculator.minutes') }}</FormLabel>
          <FormControl>
            <Input
              :model-value="timeUnitValues.minutes"
              type="number"
              min="0"
              step="any"
              @update:model-value="handleTimeUnitInput('minutes', $event)"
            />
          </FormControl>
          <Button
            variant="outline"
            size="sm"
            class="shrink-0"
            :disabled="!timeUnitValues.minutes"
            @click="copyTimeUnitValue('minutes')"
          >
            {{ t('views.time.timestamp.copy') }}
          </Button>
        </div>
        <!-- 秒 -->
        <div class="grid grid-cols-[auto_1fr_auto] items-center gap-2">
          <FormLabel class="mb-0 text-right shrink-0 pe-2">{{ t('views.time.calculator.seconds') }}</FormLabel>
          <FormControl>
            <Input
              :model-value="timeUnitValues.seconds"
              type="number"
              min="0"
              step="any"
              @update:model-value="handleTimeUnitInput('seconds', $event)"
            />
          </FormControl>
          <Button
            variant="outline"
            size="sm"
            class="shrink-0"
            :disabled="!timeUnitValues.seconds"
            @click="copyTimeUnitValue('seconds')"
          >
            {{ t('views.time.timestamp.copy') }}
          </Button>
        </div>
        <!-- 毫秒 -->
        <div class="grid grid-cols-[auto_1fr_auto] items-center gap-2">
          <FormLabel class="mb-0 text-right shrink-0 pe-2">{{ t('views.time.calculator.milliseconds') }}</FormLabel>
          <FormControl>
            <Input
              :model-value="timeUnitValues.milliseconds"
              type="number"
              min="0"
              step="any"
              @update:model-value="handleTimeUnitInput('milliseconds', $event)"
            />
          </FormControl>
          <Button
            variant="outline"
            size="sm"
            class="shrink-0"
            :disabled="!timeUnitValues.milliseconds"
            @click="copyTimeUnitValue('milliseconds')"
          >
            {{ t('views.time.timestamp.copy') }}
          </Button>
        </div>
        <!-- 微秒 -->
        <div class="grid grid-cols-[auto_1fr_auto] items-center gap-2">
          <FormLabel class="mb-0 text-right shrink-0 pe-2">{{ t('views.time.calculator.microseconds') }}</FormLabel>
          <FormControl>
            <Input
              :model-value="timeUnitValues.microseconds"
              type="number"
              min="0"
              step="any"
              @update:model-value="handleTimeUnitInput('microseconds', $event)"
            />
          </FormControl>
          <Button
            variant="outline"
            size="sm"
            class="shrink-0"
            :disabled="!timeUnitValues.microseconds"
            @click="copyTimeUnitValue('microseconds')"
          >
            {{ t('views.time.timestamp.copy') }}
          </Button>
        </div>
        <!-- 纳秒 -->
        <div class="grid grid-cols-[auto_1fr_auto] items-center gap-2">
          <FormLabel class="mb-0 text-right shrink-0 pe-2">{{ t('views.time.calculator.nanoseconds') }}</FormLabel>
          <FormControl>
            <Input
              :model-value="timeUnitValues.nanoseconds"
              type="number"
              min="0"
              step="any"
              @update:model-value="handleTimeUnitInput('nanoseconds', $event)"
            />
          </FormControl>
          <Button
            variant="outline"
            size="sm"
            class="shrink-0"
            :disabled="!timeUnitValues.nanoseconds"
            @click="copyTimeUnitValue('nanoseconds')"
          >
            {{ t('views.time.timestamp.copy') }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
