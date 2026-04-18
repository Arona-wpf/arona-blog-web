<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

const props = defineProps<{
  for?: string
  class?: HTMLAttributes['class']
  required?: boolean
  hideRequiredMark?: boolean
  requiredMark?: string
}>()
</script>

<template>
  <div class="mb-2">
    <label :for="props.for" :class="cn('text-sm font-medium', props.class)">
      <slot />
      <span v-if="props.required && !props.hideRequiredMark" aria-hidden="true" class="ml-1 text-destructive">
        {{ props.requiredMark ?? '*' }}
      </span>
    </label>
  </div>
</template>
