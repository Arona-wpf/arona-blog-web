<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <div data-slot="empty-icon" :class="cn('size-12 text-muted-foreground mb-4', props.class)">
    <slot />
  </div>
</template>
