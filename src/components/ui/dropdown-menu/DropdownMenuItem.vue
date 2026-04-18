<script setup lang="ts">
import { DropdownMenuItem } from 'reka-ui'

const props = defineProps<{
  class?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  select: []
}>()
</script>

<template>
  <DropdownMenuItem
    :class="[
      'relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none',
      'transition-colors focus:bg-accent focus:text-accent-foreground',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      props.class
    ]"
    :disabled="props.disabled"
    @select="emit('select')"
  >
    <slot />
  </DropdownMenuItem>
</template>
