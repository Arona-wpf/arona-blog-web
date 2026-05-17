<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import Empty from '@/components/ui/empty/Empty.vue'
import { cn } from '@/lib/utils'

interface Props {
  class?: HTMLAttributes['class']
  title?: string
  description?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '暂无选项',
  description: ''
})
</script>

<template>
  <div data-slot="select-empty" :class="cn('p-2', props.class)">
    <Empty :title="title" :description="description" class="py-4" />
  </div>
</template>
