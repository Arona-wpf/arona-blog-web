<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <div data-slot="empty-actions" :class="cn('mt-4 flex items-center gap-2', props.class)">
    <slot />
  </div>
</template>
