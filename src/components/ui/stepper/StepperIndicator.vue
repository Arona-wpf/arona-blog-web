<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core'
import { StepperIndicator, type StepperIndicatorProps, useForwardProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

const props = defineProps<StepperIndicatorProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class')
const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <StepperIndicator
    v-slot="slotProps"
    data-slot="stepper-indicator"
    v-bind="forwarded"
    :class="
      cn(
        'inline-flex size-8 items-center justify-center rounded-full text-muted-foreground/50',
        'group-data-[disabled]:text-muted-foreground group-data-[disabled]:opacity-50',
        'group-data-[state=active]:bg-primary group-data-[state=active]:text-primary-foreground',
        'group-data-[state=completed]:bg-accent group-data-[state=completed]:text-accent-foreground',
        props.class
      )
    "
  >
    <slot v-bind="slotProps" />
  </StepperIndicator>
</template>
