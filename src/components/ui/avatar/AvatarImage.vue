<script setup lang="ts">
import { AvatarImage } from 'reka-ui'

defineProps<{
  src?: string
  alt?: string
}>()
</script>

<template>
  <AvatarImage v-if="src" class="aspect-square h-full w-full object-cover" :src="src" :alt="alt ?? ''" />
</template>
