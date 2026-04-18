<script setup lang="ts">
import { AvatarRoot } from 'reka-ui'

const props = defineProps<{
  class?: string
  size?: 'sm' | 'md' | 'lg'
}>()

const sizeClasses = {
  sm: 'size-6',
  md: 'size-8',
  lg: 'size-10'
}
</script>

<template>
  <AvatarRoot
    :class="['relative flex shrink-0 overflow-hidden rounded-full', sizeClasses[props.size || 'md'], props.class]"
  >
    <slot />
  </AvatarRoot>
</template>
