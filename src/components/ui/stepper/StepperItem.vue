<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core'
import { StepperItem, type StepperItemProps, useForwardProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

const props = defineProps<StepperItemProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class')
const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <StepperItem
    v-slot="slotProps"
    data-slot="stepper-item"
    v-bind="forwarded"
    :class="cn('group flex justify-center items-center gap-2 data-[disabled]:pointer-events-none', props.class)"
  >
    <slot v-bind="slotProps" />
  </StepperItem>
</template>
