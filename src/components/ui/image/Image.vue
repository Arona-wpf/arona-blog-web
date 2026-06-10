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

const isLoading = ref(true)
const hasError = ref(false)

function handleLoad() {
  isLoading.value = false
  hasError.value = false
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
