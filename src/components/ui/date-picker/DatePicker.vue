<script setup lang="ts">
import { CalendarDate, type DateValue } from '@internationalized/date'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const { t } = useI18n()

interface DateValueSimple {
  year: number
  month: number
  day: number
}

const modelValue = defineModel<DateValueSimple>()

const open = defineModel<boolean>('open', { default: false })

// Calendar 使用的 DateValue
const calendarDate = ref<DateValue | undefined>()

// 初始化
if (modelValue.value) {
  calendarDate.value = new CalendarDate(modelValue.value.year, modelValue.value.month, modelValue.value.day)
}

// 检查两个日期值是否相同
function isSameDate(a: DateValueSimple | undefined, b: DateValue | undefined): boolean {
  if (!a && !b) return true
  if (!a || !b) return false
  return a.year === b.year && a.month === b.month && a.day === b.day
}

// 同步外部 modelValue 到内部状态
watch(
  () => modelValue.value,
  (val) => {
    if (val && !isSameDate(val, calendarDate.value)) {
      calendarDate.value = new CalendarDate(val.year, val.month, val.day)
    }
  }
)

// 监听日期变化，更新外部 modelValue 并关闭 Popover
watch(calendarDate, (val) => {
  if (val && !isSameDate(modelValue.value, val)) {
    modelValue.value = {
      year: val.year,
      month: val.month,
      day: val.day
    }
    // 选中日期后关闭 Popover
    open.value = false
  }
})

// 格式化显示
const displayValue = computed(() => {
  if (!calendarDate.value) return ''
  const year = calendarDate.value.year
  const month = String(calendarDate.value.month).padStart(2, '0')
  const day = String(calendarDate.value.day).padStart(2, '0')
  return `${year}-${month}-${day}`
})
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button variant="outline" class="w-[160px] justify-start font-normal">
        <span v-if="displayValue" class="font-mono">{{ displayValue }}</span>
        <span v-else class="text-muted-foreground">{{ t('components.datePicker.pickDate') }}</span>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0">
      <Calendar v-model="calendarDate" />
    </PopoverContent>
  </Popover>
</template>
