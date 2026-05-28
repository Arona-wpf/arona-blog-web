<script setup lang="ts">
import { SelectTrigger, type SelectTriggerProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

import { Spinner } from '../spinner'

interface Props extends SelectTriggerProps {
  class?: HTMLAttributes['class']
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})
</script>

<template>
  <SelectTrigger
    data-slot="select-trigger"
    :data-loading="loading ? true : undefined"
    :class="
      cn(
        'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-9 w-full items-center justify-between rounded-md border px-3 py-2 text-sm whitespace-nowrap shadow-xs focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
        props.class
      )
    "
    v-bind="props"
  >
    <Spinner v-if="loading" />
    <slot />
  </SelectTrigger>
</template>
