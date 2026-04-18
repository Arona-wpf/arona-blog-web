<script setup lang="ts">
import { DropdownMenuTrigger } from 'reka-ui'

const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <DropdownMenuTrigger :class="props.class" as-child>
    <slot />
  </DropdownMenuTrigger>
</template>
