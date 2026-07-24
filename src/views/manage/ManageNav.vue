<script setup lang="ts">
import { Lock, UserCog, Users } from 'lucide-vue-next'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import ModuleNavPage from '@/components/common/ModuleNavPage.vue'
import { useUserStore } from '@/stores/user'

const { t } = useI18n()
const userStore = useUserStore()

const isAdministrator = computed(() => userStore.userInfo?.roles?.includes('administrator'))

const features = [
  {
    path: '/manage/user',
    titleKey: 'views.manage.user.title',
    descriptionKey: 'views.manage.user.subtitle',
    icon: Users
  },
  {
    path: '/manage/role',
    titleKey: 'views.manage.role.title',
    descriptionKey: 'views.manage.role.subtitle',
    icon: UserCog
  },
  {
    path: '/manage/permission',
    titleKey: 'views.manage.permission.title',
    descriptionKey: 'views.manage.permission.subtitle',
    icon: Lock
  }
]
</script>

<template>
  <div v-if="!isAdministrator" class="flex min-h-[12rem] items-center justify-center">
    <p class="text-muted-foreground">{{ t('views.manage.user.noPermission') }}</p>
  </div>
  <ModuleNavPage
    v-else
    module-title-key="layout.nav.modules.manage"
    module-description-key="layout.nav.modules.manageDescription"
    :features="features"
  />
</template>
