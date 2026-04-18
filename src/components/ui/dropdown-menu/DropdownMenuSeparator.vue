<script setup lang="ts">
import { DropdownMenuSeparator } from 'reka-ui'

const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <DropdownMenuSeparator :class="['-mx-1 my-1 h-px bg-muted', props.class]" />
</template>
