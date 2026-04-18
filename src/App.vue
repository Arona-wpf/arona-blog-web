<script setup lang="ts">
import 'vue-sonner/style.css'

import { onMounted } from 'vue'

import { Toaster } from '@/components/ui/sonner'
import { ResponseCodeEnum } from '@/definitions/enums/request.enums'
import { pu_v1_user_status } from '@/fetch/user'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

/** 应用启动时恢复登录状态 */
onMounted(async () => {
  try {
    const res = await pu_v1_user_status()
    if (res.code === ResponseCodeEnum.SUCCESS && res.data) {
      userStore.setUserInfo(res.data)
    }
  } catch {
    userStore.clearUserInfo()
  }
})
</script>

<template>
  <RouterView />
  <Toaster position="top-center" :duration="5000" />
</template>

<style scoped></style>
