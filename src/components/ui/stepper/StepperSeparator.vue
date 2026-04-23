<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core'
import { StepperSeparator, type StepperSeparatorProps, useForwardProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

const props = defineProps<StepperSeparatorProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class')
const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <StepperSeparator
    data-slot="stepper-separator"
    v-bind="forwarded"
    :class="
      cn(
        'bg-muted',
        'group-data-[disabled]:bg-muted group-data-[disabled]:opacity-50',
        'group-data-[state=completed]:bg-accent-foreground',
        props.class
      )
    "
  />
</template>
