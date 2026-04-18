<script setup lang="ts">
import { DialogTrigger, type DialogTriggerProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props extends DialogTriggerProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <DialogTrigger data-slot="drawer-trigger" :class="cn('', props.class)" v-bind="props">
    <slot />
  </DialogTrigger>
</template>
