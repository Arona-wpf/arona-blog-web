<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core'
import { PopoverTrigger, type PopoverTriggerProps, useForwardProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

const props = defineProps<PopoverTriggerProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class')
const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <PopoverTrigger data-slot="popover-trigger" v-bind="forwardedProps" :class="cn(props.class)">
    <slot />
  </PopoverTrigger>
</template>
