<script setup lang="ts">
import { CalendarDate, type DateValue } from '@internationalized/date'
import { CalendarIcon } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface DateRange {
  start: Date
  end: Date
}

const props = withDefaults(
  defineProps<{
    modelValue?: DateRange | null
    placeholder?: string
  }>(),
  {
    placeholder: undefined
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: DateRange | null): void
}>()

const { t } = useI18n()

const open = ref(false)
const rangeStart = ref<DateValue | undefined>(undefined)
const rangeEnd = ref<DateValue | undefined>(undefined)
const today = new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())
const baseMonth = ref<CalendarDate>(new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, 1))
const syncing = ref(false)

// Separate calendar display refs (decoupled from range state)
const internalCal1 = ref<DateValue | undefined>(undefined)
const internalCal2 = ref<DateValue | undefined>(undefined)

// Initialize from modelValue
function syncFromModel() {
  const mv = props.modelValue
  if (mv) {
    rangeStart.value = new CalendarDate(mv.start.getFullYear(), mv.start.getMonth() + 1, mv.start.getDate())
    rangeEnd.value = new CalendarDate(mv.end.getFullYear(), mv.end.getMonth() + 1, mv.end.getDate())
    internalCal1.value = rangeStart.value
    internalCal2.value = rangeEnd.value
    baseMonth.value = new CalendarDate(mv.start.getFullYear(), mv.start.getMonth() + 1, 1)
  } else {
    rangeStart.value = undefined
    rangeEnd.value = undefined
    internalCal1.value = undefined
    internalCal2.value = undefined
    const now = new Date()
    baseMonth.value = new CalendarDate(now.getFullYear(), now.getMonth() + 1, 1)
  }
}

if (props.modelValue) {
  syncFromModel()
}

// Watch external modelValue changes
watch(
  () => props.modelValue,
  (newVal, oldVal) => {
    const isSame = (a: DateRange | null | undefined, b: DateRange | null | undefined) => {
      if (!a && !b) return true
      if (!a || !b) return false
      return a.start.getTime() === b.start.getTime() && a.end.getTime() === b.end.getTime()
    }
    if (!isSame(newVal, oldVal)) {
      syncFromModel()
    }
  },
  { deep: true }
)

// Sync baseMonth ↔ left calendar placeholder (M)
const leftPlaceholder = computed({
  get: () => baseMonth.value,
  set: (val: CalendarDate | undefined) => {
    if (val && !syncing.value) {
      syncing.value = true
      baseMonth.value = val
      syncing.value = false
    }
  }
})

// Right calendar placeholder (always M+1)
const rightPlaceholder = computed({
  get: () => {
    let year = baseMonth.value.year
    let month = baseMonth.value.month + 1
    if (month > 12) {
      month = 1
      year++
    }
    return new CalendarDate(year, month, 1)
  },
  set: (val: CalendarDate | undefined) => {
    if (val && !syncing.value) {
      syncing.value = true
      let year = val.year
      let month = val.month - 1
      if (month < 1) {
        month = 12
        year--
      }
      baseMonth.value = new CalendarDate(year, month, 1)
      syncing.value = false
    }
  }
})

// Handle date selection from calendar clicks
function onCal1Update(val: DateValue | undefined) {
  if (val) processDateSelection(val)
}

function onCal2Update(val: DateValue | undefined) {
  if (val) processDateSelection(val)
}

function processDateSelection(clicked: DateValue) {
  if (!rangeStart.value || (rangeStart.value && rangeEnd.value)) {
    // No start, or both set → set as start, clear end
    rangeStart.value = clicked
    rangeEnd.value = undefined
    // Show start date selected on first calendar
    internalCal1.value = clicked
    internalCal2.value = undefined
  } else if (!rangeEnd.value) {
    // Only start set
    const startDate = new Date(rangeStart.value.year, rangeStart.value.month - 1, rangeStart.value.day)
    const clickedDate = new Date(clicked.year, clicked.month - 1, clicked.day)
    if (clickedDate >= startDate) {
      rangeEnd.value = clicked
      // Show both dates selected
      internalCal1.value = rangeStart.value
      internalCal2.value = clicked
    } else {
      rangeStart.value = clicked
      rangeEnd.value = undefined
      // Replaced start, show new start selected
      internalCal1.value = clicked
      internalCal2.value = undefined
    }
  }

  // Emit when both dates are selected
  if (rangeStart.value && rangeEnd.value) {
    const s = rangeStart.value
    const e = rangeEnd.value
    emit('update:modelValue', {
      start: new Date(s.year, s.month - 1, s.day),
      end: new Date(e.year, e.month - 1, e.day)
    })
    open.value = false
  }
}

// Sync calendar display when popover opens
watch(open, (isOpen) => {
  if (isOpen) {
    if (props.modelValue) {
      const mv = props.modelValue
      internalCal1.value = new CalendarDate(mv.start.getFullYear(), mv.start.getMonth() + 1, mv.start.getDate())
      internalCal2.value = new CalendarDate(mv.end.getFullYear(), mv.end.getMonth() + 1, mv.end.getDate())
      baseMonth.value = new CalendarDate(mv.start.getFullYear(), mv.start.getMonth() + 1, 1)
    } else {
      internalCal1.value = undefined
      internalCal2.value = undefined
      const now = new Date()
      baseMonth.value = new CalendarDate(now.getFullYear(), now.getMonth() + 1, 1)
    }
  }
})

// Presets
function applyPreset(months: number) {
  const end = new Date()
  const start = new Date()
  start.setMonth(start.getMonth() - months)
  emit('update:modelValue', { start, end })
  open.value = false
}

function applyAll() {
  emit('update:modelValue', null)
  open.value = false
}

// Set end date to today
function applyToday() {
  const now = new Date()
  const todayDate = new CalendarDate(now.getFullYear(), now.getMonth() + 1, now.getDate())
  if (!rangeStart.value) {
    // No start yet: set both start and end to today
    rangeStart.value = todayDate
    internalCal1.value = todayDate
  }
  rangeEnd.value = todayDate
  internalCal2.value = todayDate
  const s = rangeStart.value
  emit(
    'update:modelValue',
    s && rangeEnd.value
      ? {
          start: new Date(s.year, s.month - 1, s.day),
          end: new Date(rangeEnd.value.year, rangeEnd.value.month - 1, rangeEnd.value.day)
        }
      : null
  )
  open.value = false
}

// Display text for trigger button
const displayText = computed(() => {
  if (props.modelValue) {
    const fmt = (d: Date) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }
    return `${fmt(props.modelValue.start)} ~ ${fmt(props.modelValue.end)}`
  }
  return props.placeholder || t('views.gacha.dateRangePicker.placeholder')
})
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button variant="outline" size="sm" class="h-7 gap-1.5 px-2.5 text-xs font-normal">
        <CalendarIcon class="size-3.5" />
        <span>{{ displayText }}</span>
      </Button>
    </PopoverTrigger>
    <PopoverContent align="end" class="w-auto p-0" :side-offset="8">
      <div class="p-3 space-y-3">
        <!-- Preset buttons -->
        <div class="flex gap-1.5 flex-wrap">
          <Button variant="outline" size="sm" class="h-6 px-2 text-xs" @click="applyPreset(3)">
            {{ t('views.gacha.dateRangePicker.last3Months') }}
          </Button>
          <Button variant="outline" size="sm" class="h-6 px-2 text-xs" @click="applyPreset(6)">
            {{ t('views.gacha.dateRangePicker.last6Months') }}
          </Button>
          <Button variant="outline" size="sm" class="h-6 px-2 text-xs" @click="applyPreset(12)">
            {{ t('views.gacha.dateRangePicker.last12Months') }}
          </Button>
          <Button variant="outline" size="sm" class="h-6 px-2 text-xs" @click="applyAll()">
            {{ t('views.gacha.dateRangePicker.all') }}
          </Button>
        </div>

        <!-- Two calendars side by side -->
        <div class="flex">
          <Calendar
            v-model="internalCal1 as any"
            v-model:placeholder="leftPlaceholder as any"
            :max-value="today"
            class="m-0!"
            @update:model-value="onCal1Update"
          />
          <Calendar
            v-model="internalCal2 as any"
            v-model:placeholder="rightPlaceholder as any"
            :max-value="today"
            class="m-0!"
            @update:model-value="onCal2Update"
          />
        </div>

        <!-- Selected range display + reset -->
        <div class="flex items-center justify-between px-1">
          <div class="text-xs text-muted-foreground">
            <template v-if="rangeStart">
              {{ rangeStart.year }}-{{ String(rangeStart.month).padStart(2, '0') }}-{{
                String(rangeStart.day).padStart(2, '0')
              }}
              <template v-if="rangeEnd">
                ~ {{ rangeEnd.year }}-{{ String(rangeEnd.month).padStart(2, '0') }}-{{
                  String(rangeEnd.day).padStart(2, '0')
                }}
              </template>
            </template>
            <template v-else>
              {{ t('views.gacha.dateRangePicker.startDate') }}
            </template>
          </div>
          <Button v-if="rangeStart" variant="ghost" size="sm" class="h-6 px-2 text-xs" @click="applyToday">
            {{ t('views.gacha.dateRangePicker.today') }}
          </Button>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
