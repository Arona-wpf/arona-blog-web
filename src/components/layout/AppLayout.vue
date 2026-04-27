<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import backgroundJpg from '@/assets/jpg/background.jpg'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider
} from '@/components/ui/sidebar'
import { useDocumentTitleI18n } from '@/composables/useDocumentTitleI18n'
import { LocaleEnum } from '@/definitions/enums/common.enum'
import AppContentFooter from '@/components/layout/AppContentFooter.vue'
import AppSiteHeader from '@/components/layout/AppSiteHeader.vue'

interface SidebarNavItem {
  to: string
  labelKey: string
}

const route = useRoute()
const { t, locale } = useI18n()

useDocumentTitleI18n()

watch(
  locale,
  (l) => {
    document.documentElement.lang = l === LocaleEnum.ZH_CN ? 'zh-Hans' : 'en'
  },
  { immediate: true }
)

const layoutSection = computed(() => [...route.matched].reverse().find((r) => Array.isArray(r.meta.sidebarNav)))

const hideSidebar = computed(() => {
  const leaf = route.matched[route.matched.length - 1]
  return leaf?.meta.hideSidebar === true
})

const sidebarNav = computed<SidebarNavItem[]>(
  () => (layoutSection.value?.meta.sidebarNav as SidebarNavItem[] | undefined) ?? []
)

function sidebarItemLabel(item: SidebarNavItem) {
  return t(item.labelKey)
}
</script>

<template>
  <div class="relative flex min-h-svh flex-col">
    <div class="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <div class="bg-background absolute inset-0" />
      <div
        class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.6] dark:opacity-[0.3]"
        :style="{ backgroundImage: `url(${backgroundJpg})` }"
      />
    </div>

    <SidebarProvider class="relative z-10 flex min-h-0 min-h-svh flex-1 flex-col !min-h-0 pt-14">
      <AppSiteHeader :show-sidebar-toggle="!hideSidebar" />

      <div
        v-if="hideSidebar"
        class="bg-background/72 supports-backdrop-filter:bg-background/40 flex min-h-0 flex-1 flex-col backdrop-blur-[2px]"
      >
        <div class="app-scrollbar flex min-h-0 min-w-0 flex-1 flex-col overflow-auto p-4 sm:p-6">
          <RouterView />
        </div>
        <AppContentFooter />
      </div>

      <div v-else class="flex min-h-0 flex-1 flex-row">
        <Sidebar collapsible="offcanvas" class="border-sidebar-border border-r">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem v-for="item in sidebarNav" :key="item.to">
                    <SidebarMenuButton as-child :is-active="route.path === item.to">
                      <RouterLink :to="item.to">
                        <span>{{ sidebarItemLabel(item) }}</span>
                      </RouterLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset
          class="flex min-h-0 min-w-0 flex-1 flex-col bg-background/72 backdrop-blur-[2px] supports-backdrop-filter:bg-background/40"
        >
          <div class="app-scrollbar flex min-h-0 min-w-0 flex-1 flex-col overflow-auto p-4 sm:p-6">
            <RouterView />
          </div>
          <AppContentFooter />
        </SidebarInset>
      </div>
    </SidebarProvider>
  </div>
</template>
