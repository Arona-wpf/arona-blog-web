<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <div data-slot="table-container" :class="cn('relative w-full overflow-auto', props.class)">
    <table class="caption-bottom text-sm">
      <slot />
    </table>
  </div>
</template>
