<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core'
import { StepperTrigger, type StepperTriggerProps, useForwardProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

const props = defineProps<StepperTriggerProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class')
const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <StepperTrigger
    data-slot="stepper-trigger"
    v-bind="forwarded"
    :class="cn('flex flex-col items-center gap-1 rounded-md p-1 text-center', props.class)"
  >
    <slot />
  </StepperTrigger>
</template>
