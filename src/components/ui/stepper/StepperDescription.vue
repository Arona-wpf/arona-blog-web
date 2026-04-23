<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core'
import { StepperDescription, type StepperDescriptionProps, useForwardProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

const props = defineProps<StepperDescriptionProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class')
const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <StepperDescription
    v-slot="slotProps"
    data-slot="stepper-description"
    v-bind="forwarded"
    :class="cn('text-xs text-muted-foreground', props.class)"
  >
    <slot v-bind="slotProps" />
  </StepperDescription>
</template>
