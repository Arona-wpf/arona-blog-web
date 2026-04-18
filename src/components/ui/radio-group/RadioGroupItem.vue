<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core'
import { Circle } from 'lucide-vue-next'
import { RadioGroupIndicator, RadioGroupItem, type RadioGroupItemProps, useForwardProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

const props = defineProps<RadioGroupItemProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class')
const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <RadioGroupItem
    data-slot="radio-group-item"
    v-bind="forwardedProps"
    :class="
      cn(
        'border-primary text-primary focus-visible:ring-ring/50 aspect-square size-4 shrink-0 rounded-full border shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        props.class
      )
    "
  >
    <RadioGroupIndicator data-slot="radio-group-indicator" class="flex items-center justify-center">
      <Circle class="fill-primary size-2.5 text-primary" />
    </RadioGroupIndicator>
  </RadioGroupItem>
</template>
