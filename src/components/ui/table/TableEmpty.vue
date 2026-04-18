<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <div data-slot="table-empty" :class="cn('flex flex-col items-center justify-center py-10 text-center', props.class)">
    <slot />
  </div>
</template>
