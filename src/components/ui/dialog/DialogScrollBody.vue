<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <div data-slot="dialog-scroll-body" :class="cn('flex-1 overflow-y-auto px-6 py-4', props.class)">
    <slot />
  </div>
</template>
