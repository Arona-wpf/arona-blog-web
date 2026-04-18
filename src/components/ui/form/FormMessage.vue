<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

const props = defineProps<{
  id?: string
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <p :id="props.id" :class="cn('text-destructive min-h-5 m-0 mb-2 text-xs', props.class)">
    <slot />
  </p>
</template>
