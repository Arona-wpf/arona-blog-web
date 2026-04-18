<script setup lang="ts">
import { Check, Minus } from 'lucide-vue-next'
import { CheckboxRoot, type CheckboxRootEmits, type CheckboxRootProps, useForwardPropsEmits } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props extends CheckboxRootProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const emits = defineEmits<CheckboxRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <CheckboxRoot
    data-slot="checkbox"
    :class="
      cn(
        'border-input bg-background ring-offset-background focus-visible:ring-ring data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary peer size-4 rounded-[4px] border shadow-xs focus-visible:ring-[3px] focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
        props.class
      )
    "
    v-bind="forwarded"
  >
    <slot>
      <Check class="size-3.5 data-[state=indeterminate]:hidden" />
      <Minus class="size-3.5 hidden data-[state=indeterminate]:block" />
    </slot>
  </CheckboxRoot>
</template>
