<script setup lang="ts">
import { AvatarImage } from 'reka-ui'
import { ref } from 'vue'

const props = defineProps<{
  src?: string
  alt?: string
}>()

const isLoading = ref(true)
const hasError = ref(false)

function onLoad() {
  isLoading.value = false
}

function onError() {
  isLoading.value = false
  hasError.value = true
}
</script>

<template>
  <AvatarImage
    v-if="src"
    class="aspect-square h-full w-full object-cover"
    :src="src"
    :alt="alt ?? ''"
    @load="onLoad"
    @error="onError"
  />
  <!-- Loading 状态骨架屏 -->
  <div
    v-if="src && isLoading && !hasError"
    class="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-muted via-muted/70 to-muted"
  />
</template>
