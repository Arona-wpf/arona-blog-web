<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core'
import { X } from 'lucide-vue-next'
import {
  DialogClose,
  DialogContent,
  type DialogContentEmits,
  type DialogContentProps,
  DialogPortal,
  useForwardPropsEmits
} from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

import DrawerOverlay from './DrawerOverlay.vue'

interface DrawerContentProps extends DialogContentProps {
  class?: HTMLAttributes['class']
  side?: 'top' | 'right' | 'bottom' | 'left'
}

defineOptions({
  inheritAttrs: false
})

const props = withDefaults(defineProps<DrawerContentProps>(), {
  side: 'bottom'
})
const emits = defineEmits<DialogContentEmits>()

const delegatedProps = reactiveOmit(props, 'class', 'side')

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <DialogPortal>
    <DrawerOverlay />
    <DialogContent
      data-slot="drawer-content"
      :class="
        cn(
          'bg-background group/drawer-content fixed z-50 flex flex-col overflow-hidden border shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
          side === 'bottom' &&
            'inset-x-0 bottom-0 h-auto max-h-[96%] rounded-t-lg data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
          side === 'top' &&
            'inset-x-0 top-0 h-auto max-h-[96%] rounded-b-lg data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
          side === 'right' &&
            'inset-y-0 right-0 h-full w-3/4 max-w-sm rounded-l-lg data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
          side === 'left' &&
            'inset-y-0 left-0 h-full w-3/4 max-w-sm rounded-r-lg data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
          props.class
        )
      "
      v-bind="{ ...$attrs, ...forwarded }"
    >
      <slot />

      <DialogClose
        class="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-secondary group-data-[side=left]/drawer-content:left-4 group-data-[side=left]/drawer-content:right-auto group-data-[side=top]/drawer-content:bottom-4 group-data-[side=top]/drawer-content:top-auto"
      >
        <X class="size-4" />
        <span class="sr-only">Close</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
