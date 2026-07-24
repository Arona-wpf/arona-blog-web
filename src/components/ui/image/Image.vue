<script setup lang="ts">
import { ref, useAttrs } from 'vue'

import imageError from '@/assets/png/image_error.png'
import { cn } from '@/lib/utils'

interface ImageProps {
  src?: string
  alt?: string
  class?: string
  imgClass?: string
  loadingClass?: string
  errorClass?: string
}

const props = withDefaults(defineProps<ImageProps>(), {
  loadingClass: 'animate-pulse bg-primary/10',
  errorClass: ''
})

const attrs = useAttrs()

// 没有 src 时直接视为错误状态，避免空 src 触发 @error 后与 @load 交替循环闪烁
const hasError = ref(!props.src)
const isLoading = ref(!!props.src)

function handleLoad() {
  isLoading.value = false
  // 仅当真实 src 存在时才清除错误状态，避免 imageError 加载成功后又切回空 src 导致循环闪烁
  if (props.src) {
    hasError.value = false
  }
}

function handleError() {
  isLoading.value = false
  hasError.value = true
}
</script>

<template>
  <div :class="cn('relative isolate overflow-hidden', props.class)" data-slot="image">
    <div v-if="isLoading" :class="cn('absolute inset-0 rounded-inherit', props.loadingClass)" />
    <img
      v-bind="attrs"
      :src="hasError ? imageError : props.src"
      :alt="props.alt"
      :class="cn('size-full object-cover', props.imgClass, hasError && props.errorClass)"
      @load="handleLoad"
      @error="handleError"
    />
  </div>
</template>
