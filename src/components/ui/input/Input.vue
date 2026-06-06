<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { X } from 'lucide-vue-next'
import { computed, type HTMLAttributes, useAttrs } from 'vue'

import { cn } from '@/lib/utils'

defineOptions({
  inheritAttrs: false
})

const props = withDefaults(
  defineProps<{
    defaultValue?: string | number
    modelValue?: string | number
    class?: HTMLAttributes['class']
    /** 由 v-model.trim / v-model.number 注入 */
    modelModifiers?: { trim?: boolean; number?: boolean }
    /** 是否显示清空按钮 */
    clearable?: boolean
  }>(),
  {
    clearable: true
  }
)

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
  (e: 'clear'): void
}>()

const attrs = useAttrs()

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

const isDisabled = computed(() => attrs.disabled === true || attrs.disabled === '')

const canClear = computed(() => {
  if (!props.clearable || isDisabled.value) return false
  const value = baseModel.value
  return value !== null && value !== undefined && value !== ''
})

function handleClear() {
  inputModel.value = ''
  emits('clear')
}
</script>

<template>
  <div class="group relative w-full">
    <input
      v-bind="$attrs"
      v-model="inputModel"
      data-slot="input"
      :class="
        cn(
          'file:text-foreground placeholder:text-muted-foreground/50 selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input m-0 block h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          canClear && 'pr-9',
          props.class
        )
      "
    />
    <button
      v-if="canClear"
      type="button"
      tabindex="-1"
      class="text-muted-foreground hover:text-foreground pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-0.5 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100"
      @mousedown.prevent
      @click="handleClear"
    >
      <X class="size-4" />
      <span class="sr-only">Clear</span>
    </button>
  </div>
</template>
