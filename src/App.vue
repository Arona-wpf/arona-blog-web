<script setup lang="ts">
import 'vue-sonner/style.css'

import { Toaster } from '@/components/ui/sonner'
</script>

<template>
  <RouterView />
  <Toaster position="top-center" :duration="3000" close-button />
</template>

<style scoped></style>
