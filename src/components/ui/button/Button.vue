<script setup lang="ts">
import { Primitive, type PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

import { Spinner } from '../spinner'
import { type ButtonVariants, buttonVariants } from '.'

interface Props extends PrimitiveProps {
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  class?: HTMLAttributes['class']
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button'
})
</script>

<template>
  <Primitive
    data-slot="button"
    :data-variant="variant"
    :data-size="size"
    :as="as"
    :as-child="asChild"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <Spinner v-if="loading" />
    <slot />
  </Primitive>
</template>
