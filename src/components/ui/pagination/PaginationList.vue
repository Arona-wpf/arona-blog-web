<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <ul data-slot="pagination-list" :class="cn('flex flex-row items-center gap-1', props.class)">
    <slot />
  </ul>
</template>
