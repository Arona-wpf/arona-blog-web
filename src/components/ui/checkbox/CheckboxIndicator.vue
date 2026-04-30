<script setup lang="ts">
import { CheckboxIndicator, type CheckboxIndicatorProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props extends CheckboxIndicatorProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <CheckboxIndicator
    data-slot="checkbox-indicator"
    :class="cn('flex items-center justify-center text-current', props.class)"
    :force-mount="props.forceMount"
    v-bind="props"
  >
    <slot />
  </CheckboxIndicator>
</template>