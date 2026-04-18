<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { computed, type HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  class?: HTMLAttributes['class']
  /** 由 v-model.trim / v-model.number 注入 */
  modelModifiers?: { trim?: boolean; number?: boolean }
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

const baseModel = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue
})

function applyModelModifiers(value: string | number): string | number {
  let v = value
  if (props.modelModifiers?.trim && typeof v === 'string') v = v.trim()
  if (props.modelModifiers?.number) {
    if (v === '' || (typeof v === 'number' && Number.isNaN(v))) return v
    const n = typeof v === 'number' ? v : Number.parseFloat(String(v))
    return Number.isNaN(n) ? v : n
  }
  return v
}

const inputModel = computed({
  get: () => baseModel.value,
  set: (v: string | number) => {
    baseModel.value = applyModelModifiers(v)
  }
})
</script>

<template>
  <input
    v-model="inputModel"
    data-slot="input"
    :class="
      cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input m-0 block h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        props.class
      )
    "
  />
</template>
