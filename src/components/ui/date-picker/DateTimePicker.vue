<script setup lang="ts">
import { CalendarDate, type DateValue } from '@internationalized/date'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const { t } = useI18n()

interface DateTimeValue {
  year: number
  month: number
  day: number
  hours: number
  minutes: number
}

const modelValue = defineModel<DateTimeValue>()

const open = defineModel<boolean>('open', { default: false })

// Calendar 使用的 DateValue
const calendarDate = ref<DateValue | undefined>()

// 时间输入
const hoursInput = ref<string>('00')
const minutesInput = ref<string>('00')

// 初始化
if (modelValue.value) {
  calendarDate.value = new CalendarDate(modelValue.value.year, modelValue.value.month, modelValue.value.day)
  hoursInput.value = String(modelValue.value.hours).padStart(2, '0')
  minutesInput.value = String(modelValue.value.minutes).padStart(2, '0')
}

// 同步外部 modelValue 到内部状态（仅在值不同时）
watch(
  () => modelValue.value,
  (val) => {
    if (val) {
      const newDate = new CalendarDate(val.year, val.month, val.day)
      const newHours = String(val.hours).padStart(2, '0')
      const newMinutes = String(val.minutes).padStart(2, '0')

      // 只在值真的不同时才更新内部状态
      const currentHours = parseInt(hoursInput.value, 10) || 0
      const currentMinutes = parseInt(minutesInput.value, 10) || 0

      const dateChanged =
        !calendarDate.value ||
        calendarDate.value.year !== val.year ||
        calendarDate.value.month !== val.month ||
        calendarDate.value.day !== val.day

      const timeChanged = currentHours !== val.hours || currentMinutes !== val.minutes

      if (dateChanged) {
        calendarDate.value = newDate
      }
      if (timeChanged) {
        hoursInput.value = newHours
        minutesInput.value = newMinutes
      }
    }
  }
)

// 监听日期变化，更新外部 modelValue
watch(calendarDate, (val) => {
  if (!val) {
    modelValue.value = undefined
    return
  }

  const hours = parseInt(hoursInput.value, 10) || 0
  const minutes = parseInt(minutesInput.value, 10) || 0

  // 只在值不同时才更新
  if (
    modelValue.value &&
    modelValue.value.year === val.year &&
    modelValue.value.month === val.month &&
    modelValue.value.day === val.day &&
    modelValue.value.hours === hours &&
    modelValue.value.minutes === minutes
  ) {
    return
  }

  modelValue.value = {
    year: val.year,
    month: val.month,
    day: val.day,
    hours,
    minutes
  }
})

// 监听时间输入变化，更新外部 modelValue
watch([hoursInput, minutesInput], () => {
  if (!calendarDate.value) return

  const hours = parseInt(hoursInput.value, 10) || 0
  const minutes = parseInt(minutesInput.value, 10) || 0

  // 只在值不同时才更新
  if (
    modelValue.value &&
    modelValue.value.year === calendarDate.value.year &&
    modelValue.value.month === calendarDate.value.month &&
    modelValue.value.day === calendarDate.value.day &&
    modelValue.value.hours === hours &&
    modelValue.value.minutes === minutes
  ) {
    return
  }

  modelValue.value = {
    year: calendarDate.value.year,
    month: calendarDate.value.month,
    day: calendarDate.value.day,
    hours,
    minutes
  }
})

// 格式化显示
const displayValue = computed(() => {
  if (!calendarDate.value) return ''

  const year = calendarDate.value.year
  const month = String(calendarDate.value.month).padStart(2, '0')
  const day = String(calendarDate.value.day).padStart(2, '0')
  const hours = String(Math.min(23, Math.max(0, parseInt(hoursInput.value, 10) || 0))).padStart(2, '0')
  const minutes = String(Math.min(59, Math.max(0, parseInt(minutesInput.value, 10) || 0))).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}`
})

// 校验输入
function clampHours() {
  const val = parseInt(hoursInput.value, 10)
  if (isNaN(val) || val < 0) hoursInput.value = '00'
  else if (val > 23) hoursInput.value = '23'
  else hoursInput.value = String(val).padStart(2, '0')
}

function clampMinutes() {
  const val = parseInt(minutesInput.value, 10)
  if (isNaN(val) || val < 0) minutesInput.value = '00'
  else if (val > 59) minutesInput.value = '59'
  else minutesInput.value = String(val).padStart(2, '0')
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button variant="outline" class="w-[200px] justify-start font-normal">
        <span v-if="displayValue" class="font-mono">{{ displayValue }}</span>
        <span v-else class="text-muted-foreground">{{ t('components.datePicker.pickDateTime') }}</span>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0">
      <div class="p-3 space-y-3">
        <Calendar v-model="calendarDate" />
        <div class="flex items-center gap-2 pt-2 border-t">
          <span class="text-sm text-muted-foreground">{{ t('components.datePicker.time') }}</span>
          <Input
            v-model="hoursInput"
            type="number"
            min="0"
            max="23"
            class="w-[60px] text-center font-mono"
            @blur="clampHours"
          />
          <span class="text-muted-foreground">:</span>
          <Input
            v-model="minutesInput"
            type="number"
            min="0"
            max="59"
            class="w-[60px] text-center font-mono"
            @blur="clampMinutes"
          />
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
