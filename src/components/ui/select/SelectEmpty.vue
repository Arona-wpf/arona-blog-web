<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { Button } from '@/components/ui/button'
import Empty from '@/components/ui/empty/Empty.vue'
import { cn } from '@/lib/utils'

interface Props {
  class?: HTMLAttributes['class']
  title?: string
  description?: string
  showButton?: boolean
  buttonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
  showButton: false,
  buttonText: ''
})

const emit = defineEmits<{
  (e: 'custom-button'): void
}>()

function handleButtonClick() {
  emit('custom-button')
}
</script>

<template>
  <div data-slot="select-empty" :class="cn('p-2', props.class)">
    <Empty :title="title" :description="description" class="py-4">
      <Button v-if="showButton" size="sm" @click="handleButtonClick">
        {{ buttonText }}
      </Button>
    </Empty>
  </div>
</template>
