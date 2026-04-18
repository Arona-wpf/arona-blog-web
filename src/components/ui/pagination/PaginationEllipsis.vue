<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <li data-slot="pagination-ellipsis" :class="cn('flex h-9 w-9 items-center justify-center', props.class)">
    <span class="text-muted-foreground"> ... </span>
    <span class="sr-only">More pages</span>
  </li>
</template>
