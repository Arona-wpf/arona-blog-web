<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

defineOptions({
  inheritAttrs: false
})

const props = defineProps<{
  class?: HTMLAttributes['class']
  name: string
}>()
</script>

<template>
  <form v-bind="$attrs" :name="props.name" :class="cn('space-y-5', props.class)">
    <slot />
  </form>
</template>
