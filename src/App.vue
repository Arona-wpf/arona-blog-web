<script setup lang="ts">
import 'vue-sonner/style.css'

import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Toaster } from '@/components/ui/sonner'
import { wsService } from '@/lib/websocket'
import { useUserStore } from '@/stores/user'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const kickedDialogOpen = ref(false)
const shouldRouteToLogin = ref(false)

const handleKickedDialogClose = () => {
  kickedDialogOpen.value = false
}

const handleGoLogin = () => {
  kickedDialogOpen.value = false
  if (shouldRouteToLogin.value) {
    router.push({ path: '/user/login' })
  }
}

const handleSessionKicked = () => {
  userStore.clearUserInfo()
  wsService.disconnect()

  const needsAuth = Boolean(route.meta.requireAuth || route.meta.authOnly404 || route.meta.requireAdmin)
  shouldRouteToLogin.value = route.path !== '/user/login' || needsAuth
  kickedDialogOpen.value = true
}

onMounted(() => {
  wsService.onSessionKicked(handleSessionKicked)
})

onUnmounted(() => {
  wsService.onSessionKicked(() => undefined)
})
</script>

<template>
  <RouterView />
  <Dialog :open="kickedDialogOpen" @update:open="handleKickedDialogClose">
    <DialogContent>
      <DialogHeader class="pb-0">
        <DialogTitle>{{ t('global.ws.kickedByAnotherLogin') }}</DialogTitle>
        <DialogDescription class="space-y-2 mt-2">
          <p>{{ t('global.ws.kicked') }}</p>
          <p class="text-red-500">{{ t('global.ws.kickedSecurityTip') }}</p>
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="flex-row justify-end gap-3 pt-6">
        <Button variant="outline" @click="handleKickedDialogClose">{{ t('global.action.close') }}</Button>
        <Button @click="handleGoLogin">{{ t('global.action.goLogin') }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  <Toaster position="top-center" :duration="3000" :expand="true" close-button />
</template>

<style scoped></style>
