<script setup lang="ts">
import { AvatarFallback } from 'reka-ui'

const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <AvatarFallback :class="['flex h-full w-full items-center justify-center rounded-full bg-muted', props.class]">
    <slot />
  </AvatarFallback>
</template>
