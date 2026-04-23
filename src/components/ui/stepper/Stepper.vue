<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core'
import { StepperRoot, type StepperRootEmits, type StepperRootProps, useForwardPropsEmits } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

const props = defineProps<StepperRootProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<StepperRootEmits>()

const delegatedProps = reactiveOmit(props, 'class')
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <StepperRoot v-slot="slotProps" data-slot="stepper" :class="cn('flex gap-2', props.class)" v-bind="forwarded">
    <slot v-bind="slotProps" />
  </StepperRoot>
</template>
