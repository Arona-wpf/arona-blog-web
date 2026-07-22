<script setup lang="ts">
import { Lock, UserCog, Users } from 'lucide-vue-next'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { Button } from '@/components/ui/button'
import { useUserStore } from '@/stores/user'

const { t } = useI18n()
const userStore = useUserStore()

const isAdministrator = computed(() => userStore.userInfo?.roles?.includes('administrator'))

const features = [
  {
    to: '/manage/user',
    labelKey: 'layout.nav.sub.manageUser',
    descKey: 'views.manage.user.subtitle',
    icon: Users
  },
  {
    to: '/manage/role',
    labelKey: 'layout.nav.sub.manageRole',
    descKey: 'views.manage.role.subtitle',
    icon: UserCog
  },
  {
    to: '/manage/permission',
    labelKey: 'layout.nav.sub.managePermission',
    descKey: 'views.manage.permission.subtitle',
    icon: Lock
  }
]
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.manage.title') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('views.manage.subtitle') }}</p>
    </div>

    <div v-if="!isAdministrator" class="flex min-h-[12rem] items-center justify-center">
      <p class="text-muted-foreground">{{ t('views.manage.user.noPermission') }}</p>
    </div>

    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="feature in features"
        :key="feature.to"
        class="border-border/60 rounded-xl border p-4 shadow-sm transition-colors hover:border-border sm:p-5"
      >
        <div class="flex items-center gap-3">
          <component :is="feature.icon" class="size-5 shrink-0 text-muted-foreground" />
          <h3 class="text-base font-medium">{{ t(feature.labelKey) }}</h3>
        </div>
        <p class="text-muted-foreground mt-3 text-sm leading-relaxed">{{ t(feature.descKey) }}</p>
        <div class="mt-4">
          <Button size="sm" as-child>
            <router-link :to="feature.to">{{ t('layout.nav.module.goToFeature') }}</router-link>
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
