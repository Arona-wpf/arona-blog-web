<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  class?: HTMLAttributes['class']
  isActive?: boolean
  page: number
}

const props = defineProps<Props>()
</script>

<template>
  <Button
    data-slot="pagination-link"
    :variant="isActive ? 'default' : 'ghost'"
    size="icon-sm"
    :class="cn('', props.class)"
    :aria-current="isActive ? 'page' : undefined"
  >
    {{ page }}
  </Button>
</template>
