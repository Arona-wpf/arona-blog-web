<script setup lang="ts">
import { SwitchRoot, type SwitchRootEmits, type SwitchRootProps, useForwardPropsEmits } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props extends SwitchRootProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const emits = defineEmits<SwitchRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <SwitchRoot
    data-slot="switch"
    :class="
      cn(
        'border-input bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary dark:data-[state=checked]:bg-primary/30 peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border shadow-xs transition-[color,shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        props.class
      )
    "
    v-bind="forwarded"
  >
    <slot />
  </SwitchRoot>
</template>
