<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <h3 data-slot="empty-title" :class="cn('text-lg font-medium text-foreground mb-1', props.class)">
    <slot />
  </h3>
</template>
