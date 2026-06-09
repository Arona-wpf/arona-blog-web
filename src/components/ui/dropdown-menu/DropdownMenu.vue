<script setup lang="ts">
import { DropdownMenuRoot } from 'reka-ui'

const open = defineModel<boolean>('open')

const props = withDefaults(
  defineProps<{
    modal?: boolean
  }>(),
  {
    modal: true
  }
)
</script>

<template>
  <DropdownMenuRoot v-model:open="open" :modal="props.modal">
    <slot />
  </DropdownMenuRoot>
</template>
