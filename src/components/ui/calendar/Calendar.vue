<script setup lang="ts">
import { CalendarDate, type DateValue } from '@internationalized/date'
import { reactiveOmit } from '@vueuse/core'
import { Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import {
  CalendarCell,
  CalendarCellTrigger,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHead,
  CalendarGridRow,
  CalendarHeadCell,
  CalendarHeader,
  CalendarHeading,
  CalendarNext,
  CalendarPrev,
  CalendarRoot,
  type CalendarRootProps,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport
} from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'
import { useI18n } from 'vue-i18n'

import { buttonVariants } from '@/components/ui/button'
import { LocaleEnum } from '@/definitions/enums/common.enum'
import { cn } from '@/lib/utils'

const { locale: i18nLocale } = useI18n()

const props = defineProps<Omit<CalendarRootProps, 'modelValue'> & { class?: HTMLAttributes['class'] }>()

const modelValue = defineModel<DateValue | undefined>('modelValue')
const placeholderValue = defineModel<DateValue | undefined>('placeholder')
const today = new Date()
const fallbackYear = today.getFullYear()
const fallbackMonth = today.getMonth() + 1

const delegated = reactiveOmit(props, 'class', 'locale', 'placeholder')

const resolvedLocale = computed(
  () => props.locale ?? (i18nLocale.value === LocaleEnum.ZH_CN ? LocaleEnum.ZH_CN : LocaleEnum.EN_US)
)

const currentYear = computed(() => placeholderValue.value?.year ?? modelValue.value?.year ?? fallbackYear)
const currentMonth = computed(() => placeholderValue.value?.month ?? modelValue.value?.month ?? fallbackMonth)

const years = computed(() => {
  const base = currentYear.value
  const list: number[] = []
  for (let y = base - 50; y <= base + 50; y++) list.push(y)
  return list
})

const monthNames = computed(() => {
  const formatter = new Intl.DateTimeFormat(resolvedLocale.value, { month: 'short' })
  return Array.from({ length: 12 }, (_, month) => ({
    value: month + 1,
    label: formatter.format(new Date(2000, month, 1))
  }))
})

function onYearChange(year: number) {
  const cur = ensurePlaceholder()
  placeholderValue.value = cur.set({ year, month: cur.month, day: Math.min(cur.day, getDaysInMonth(year, cur.month)) })
}

function onMonthChange(month: number) {
  const cur = ensurePlaceholder()
  placeholderValue.value = cur.set({ year: cur.year, month, day: Math.min(cur.day, getDaysInMonth(cur.year, month)) })
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function ensurePlaceholder() {
  if (placeholderValue.value) return placeholderValue.value

  const base = modelValue.value?.set({ day: 1 }) ?? new CalendarDate(fallbackYear, fallbackMonth, 1)
  placeholderValue.value = base
  return base
}

const yearValue = computed({
  get: () => String(currentYear.value),
  set: (value: string) => onYearChange(Number(value))
})

const monthValue = computed({
  get: () => String(currentMonth.value),
  set: (value: string) => onMonthChange(Number(value))
})
</script>

<template>
  <CalendarRoot
    v-model="modelValue"
    v-model:placeholder="placeholderValue"
    data-slot="calendar"
    v-bind="delegated"
    :locale="resolvedLocale"
    :class="cn('w-fit rounded-md border bg-transparent m-3', props.class)"
  >
    <template #default="{ grid, weekDays }">
      <CalendarHeader class="flex w-full items-center justify-between gap-1 pb-4">
        <CalendarPrev :class="cn(buttonVariants({ variant: 'outline' }), 'size-7 p-0 aria-disabled:opacity-50')">
          <ChevronLeft class="size-4" />
        </CalendarPrev>
        <CalendarHeading class="flex items-center gap-2 text-sm font-medium">
          <SelectRoot v-model="yearValue">
            <SelectTrigger
              :class="
                cn(
                  'h-8 min-w-[5.75rem] inline-flex items-center justify-between rounded-md border border-input bg-background px-2 text-sm ring-offset-background',
                  'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                )
              "
            >
              <SelectValue />
              <ChevronDown class="size-4 opacity-70" />
            </SelectTrigger>
            <SelectPortal>
              <SelectContent
                position="popper"
                :side-offset="4"
                :class="
                  cn(
                    'bg-popover text-popover-foreground relative z-50 max-h-72 min-w-[5.75rem] overflow-hidden rounded-md border shadow-md',
                    'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
                  )
                "
              >
                <SelectViewport class="p-1">
                  <SelectItem
                    v-for="y in years"
                    :key="y"
                    :value="String(y)"
                    class="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  >
                    <SelectItemIndicator class="absolute right-2 inline-flex size-3.5 items-center justify-center">
                      <Check class="size-3.5" />
                    </SelectItemIndicator>
                    <SelectItemText>{{ y }}</SelectItemText>
                  </SelectItem>
                </SelectViewport>
              </SelectContent>
            </SelectPortal>
          </SelectRoot>

          <SelectRoot v-model="monthValue">
            <SelectTrigger
              :class="
                cn(
                  'h-8 min-w-[5.75rem] inline-flex items-center justify-between rounded-md border border-input bg-background px-2 text-sm ring-offset-background',
                  'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                )
              "
            >
              <SelectValue />
              <ChevronDown class="size-4 opacity-70" />
            </SelectTrigger>
            <SelectPortal>
              <SelectContent
                position="popper"
                :side-offset="4"
                :class="
                  cn(
                    'bg-popover text-popover-foreground relative z-50 max-h-72 min-w-[5.75rem] overflow-hidden rounded-md border shadow-md',
                    'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
                  )
                "
              >
                <SelectViewport class="p-1">
                  <SelectItem
                    v-for="m in monthNames"
                    :key="m.value"
                    :value="String(m.value)"
                    class="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  >
                    <SelectItemIndicator class="absolute right-2 inline-flex size-3.5 items-center justify-center">
                      <Check class="size-3.5" />
                    </SelectItemIndicator>
                    <SelectItemText>{{ m.label }}</SelectItemText>
                  </SelectItem>
                </SelectViewport>
              </SelectContent>
            </SelectPortal>
          </SelectRoot>
        </CalendarHeading>
        <CalendarNext :class="cn(buttonVariants({ variant: 'outline' }), 'size-7 p-0 aria-disabled:opacity-50')">
          <ChevronRight class="size-4" />
        </CalendarNext>
      </CalendarHeader>
      <template v-for="month in grid" :key="month.value.toString()">
        <CalendarGrid>
          <CalendarGridHead>
            <CalendarGridRow>
              <CalendarHeadCell
                v-for="day in weekDays"
                :key="day"
                class="text-muted-foreground w-9 text-center text-[0.8rem] font-normal"
              >
                {{ day }}
              </CalendarHeadCell>
            </CalendarGridRow>
          </CalendarGridHead>
          <CalendarGridBody>
            <CalendarGridRow v-for="(weekDates, wi) in month.rows" :key="wi">
              <CalendarCell
                v-for="day in weekDates"
                :key="day.toString()"
                :date="day"
                class="relative p-0 text-center text-sm focus-within:relative focus-within:z-20"
              >
                <CalendarCellTrigger
                  :day="day"
                  :month="month.value"
                  :class="
                    cn(
                      buttonVariants({ variant: 'ghost' }),
                      'size-8 p-0 font-normal',
                      'data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:hover:bg-primary data-[selected]:hover:text-primary-foreground',
                      'data-[today]:border-primary data-[today]:border',
                      'data-[outside-view]:text-muted-foreground/60',
                      'data-[disabled]:text-muted-foreground data-[disabled]:opacity-50'
                    )
                  "
                />
              </CalendarCell>
            </CalendarGridRow>
          </CalendarGridBody>
        </CalendarGrid>
      </template>
    </template>
  </CalendarRoot>
</template>
