<script setup lang="ts">
import { SelectPortal, type SelectPortalProps } from 'reka-ui'

const props = defineProps<SelectPortalProps>()
</script>

<template>
  <SelectPortal data-slot="select-portal" v-bind="props">
    <slot />
  </SelectPortal>
</template>
