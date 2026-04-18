<script setup lang="ts">
import { ComboboxPortal, type ComboboxPortalProps } from 'reka-ui'

const props = defineProps<ComboboxPortalProps>()
</script>

<template>
  <ComboboxPortal data-slot="combobox-portal" v-bind="props">
    <slot />
  </ComboboxPortal>
</template>
