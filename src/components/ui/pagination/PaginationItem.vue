<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props {
  class?: HTMLAttributes['class']
  isActive?: boolean
}

const props = defineProps<Props>()
</script>

<template>
  <li data-slot="pagination-item" :class="cn('', props.class)">
    <slot />
  </li>
</template>
