<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { computed, type HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

const props = defineProps<{
  defaultValue?: string
  modelValue?: string
  class?: HTMLAttributes['class']
  /** 由 v-model.trim 注入 */
  modelModifiers?: { trim?: boolean }
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string): void
}>()

const baseModel = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue
})

const textareaModel = computed({
  get: () => baseModel.value,
  set: (v: string) => {
    baseModel.value = props.modelModifiers?.trim ? v.trim() : v
  }
})
</script>

<template>
  <textarea
    v-model="textareaModel"
    data-slot="textarea"
    :class="
      cn(
        'border-input placeholder:text-muted-foreground/50 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:ring-[3px]',
        props.class
      )
    "
  />
</template>
