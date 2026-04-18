<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core'
import {
  ComboboxContent,
  type ComboboxContentEmits,
  type ComboboxContentProps,
  ComboboxPortal,
  useForwardPropsEmits
} from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props extends ComboboxContentProps {
  class?: HTMLAttributes['class']
}

defineOptions({
  inheritAttrs: false
})

const props = withDefaults(defineProps<Props>(), {
  position: 'popper',
  align: 'start',
  sideOffset: 4
})
const emits = defineEmits<ComboboxContentEmits>()

const delegatedProps = reactiveOmit(props, 'class')

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <ComboboxPortal>
    <ComboboxContent
      data-slot="combobox-content"
      :class="
        cn(
          'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-96 w-[var(--reka-combobox-trigger-width)] min-w-32 rounded-md border shadow-md',
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          props.class
        )
      "
      v-bind="{ ...$attrs, ...forwarded }"
    >
      <slot />
    </ComboboxContent>
  </ComboboxPortal>
</template>
