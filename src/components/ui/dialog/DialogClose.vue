<script setup lang="ts">
import { DialogClose, type DialogCloseProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props extends DialogCloseProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <DialogClose data-slot="dialog-close" :class="cn('', props.class)" v-bind="props">
    <slot />
  </DialogClose>
</template>
