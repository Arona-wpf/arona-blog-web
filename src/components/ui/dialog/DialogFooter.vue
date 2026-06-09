<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <div
    data-slot="dialog-footer"
    :class="cn('flex flex-row flex-wrap items-center justify-end gap-3 px-6 pt-4 pb-6 shrink-0', props.class)"
  >
    <slot />
  </div>
</template>
