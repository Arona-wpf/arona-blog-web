<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { Button } from '@/components/ui/button'
import { DatePicker, DateTimePicker } from '@/components/ui/date-picker'

const { t } = useI18n()

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
  </div>
</template>
