<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import { Github, KeyRound, Languages, LogIn, LogOut, Menu, Moon, PanelLeft, Sun, User } from 'lucide-vue-next'
import { HoverCardContent, HoverCardPortal, HoverCardRoot, HoverCardTrigger } from 'reka-ui'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import DefaultAvatar from '@/assets/jpg/arona.jpg'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useSidebar } from '@/components/ui/sidebar/utils'
import { useAppColorMode } from '@/composables/useAppColorMode'
import { SITE_GITHUB_URL } from '@/definitions/constants/site.constants'
import { LocaleEnum } from '@/definitions/enums/common.enum'
import { ResponseCodeEnum } from '@/definitions/enums/request.enums'
import { pu_v1_locale_set } from '@/fetch/locale'
import { pr_v1_logout } from '@/fetch/logout'
import { type TopNavModule, topNavModuleIcons, topNavModules } from '@/lib/top-nav'
import { cn } from '@/lib/utils'
import { LOCALE_STORAGE_KEY } from '@/plugins/i18n'
import { useUserStore } from '@/stores/user'

defineProps<{
  showSidebarToggle: boolean
}>()

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const isMdUp = useMediaQuery('(min-width: 768px)')
const isDark = useAppColorMode()
const mobileNavOpen = ref(false)
const userStore = useUserStore()

const { toggleSidebar } = useSidebar()

watch(
  () => route.path,
  () => {
    mobileNavOpen.value = false
  }
)

function isModuleActive(prefix: string) {
  return route.path === prefix || route.path.startsWith(`${prefix}/`)
}

function moduleDefaultPath(mod: TopNavModule) {
  return mod.items[0]!.to
}

function setLocale(next: LocaleEnum) {
  locale.value = next
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LOCALE_STORAGE_KEY, next)
  }
}

function cycleLocale() {
  /** 获取当前语言 */
  const currentLocale = locale.value

  /** 设置服务端语言 */
  pu_v1_locale_set({ locale: currentLocale === LocaleEnum.ZH_CN ? LocaleEnum.EN_US : LocaleEnum.ZH_CN }).then((res) => {
    /** 设置语言 */
    setLocale(currentLocale === LocaleEnum.ZH_CN ? LocaleEnum.EN_US : LocaleEnum.ZH_CN)
    toast.success(res.msg)
  })
}

function toggleTheme() {
  isDark.value = !isDark.value
}

const themeLabel = computed(() => (isDark.value ? t('layout.nav.themeLight') : t('layout.nav.themeDark')))

const isLoggedIn = computed(() => userStore.userInfo !== null)

const userAvatarAlt = computed(() => userStore.userInfo?.nickname || '')

const userAvatarSrc = computed(() =>
  userStore.userInfo?.avatar ? `/cdn/${userStore.userInfo?.avatar}` : DefaultAvatar
)

function goToProfile() {
  router.push('/user/profile')
}

function goToChangePassword() {
  router.push('/user/password')
}

function handleLogout() {
  pr_v1_logout().then((res) => {
    if (res.code === ResponseCodeEnum.SUCCESS) {
      userStore.clearUserInfo()
      toast.success(t('views.user.login.logoutSuccess'))
      router.push('/user/login')
    }
  })
}
</script>

<template>
  <header
    :class="[
      'border-border bg-background/72 supports-backdrop-filter:bg-background/40',
      'fixed top-0 left-0 right-0 z-50 flex h-14 shrink-0 items-center border-b px-3 backdrop-blur-[2px]',
      'md:grid md:grid-cols-[minmax(0,16rem)_1fr_minmax(0,16rem)] md:gap-3 md:px-4'
    ]"
  >
    <div
      :class="[
        'flex min-h-0 min-w-0 flex-1 items-center gap-2 md:w-auto md:max-w-[16rem] md:flex-none',
        'md:justify-start'
      ]"
    >
      <Button
        v-if="showSidebarToggle"
        variant="ghost"
        size="icon"
        class="h-9 w-9 shrink-0"
        :aria-label="t('layout.sidebar.toggle')"
        @click="toggleSidebar"
      >
        <PanelLeft class="size-4" />
      </Button>
      <RouterLink
        to="/"
        class="text-foreground hover:text-foreground/80 min-w-0 truncate text-sm font-semibold tracking-tight"
      >
        {{ t('layout.siteName') }}
      </RouterLink>
    </div>

    <nav
      class="text-muted-foreground hidden min-w-0 items-center justify-center gap-1 md:flex"
      :aria-label="t('layout.nav.primaryAria')"
    >
      <HoverCardRoot v-for="mod in topNavModules" :key="mod.id" :open-delay="120" :close-delay="80">
        <HoverCardTrigger as-child>
          <Button variant="ghost" size="sm" as-child>
            <RouterLink
              :to="moduleDefaultPath(mod)"
              :class="
                cn(
                  'inline-flex max-w-full items-center gap-1.5 no-underline',
                  isModuleActive(mod.prefix) && 'bg-accent text-accent-foreground'
                )
              "
            >
              <component :is="topNavModuleIcons[mod.id]" class="size-4 shrink-0" />
              <span class="max-w-[5.5rem] truncate">{{ t(mod.labelKey) }}</span>
            </RouterLink>
          </Button>
        </HoverCardTrigger>
        <HoverCardPortal>
          <HoverCardContent
            side="bottom"
            :side-offset="6"
            align="center"
            class="border-border bg-popover text-popover-foreground data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50 w-52 rounded-md border p-1 shadow-md outline-none"
          >
            <div class="flex flex-col gap-0.5">
              <RouterLink
                v-for="item in mod.items"
                :key="item.to"
                :to="item.to"
                class="hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-sm px-2 py-2 text-sm transition-colors"
                :class="route.path === item.to ? 'bg-accent/70 text-accent-foreground' : 'text-foreground'"
              >
                <component :is="item.icon" class="text-muted-foreground size-4 shrink-0" />
                <span>{{ t(item.labelKey) }}</span>
              </RouterLink>
            </div>
          </HoverCardContent>
        </HoverCardPortal>
      </HoverCardRoot>
    </nav>

    <div :class="['flex shrink-0 items-center justify-end gap-0.5 sm:gap-1', 'md:max-w-[16rem] md:justify-end']">
      <Sheet v-if="!isMdUp" v-model:open="mobileNavOpen">
        <SheetTrigger as-child>
          <Button variant="ghost" size="icon" class="h-9 w-9" :aria-label="t('layout.nav.mobileMenuOpen')">
            <Menu class="size-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" class="flex w-[min(100vw,18rem)] flex-col gap-4 p-4">
          <SheetHeader>
            <SheetTitle>{{ t('layout.nav.mobileMenu') }}</SheetTitle>
            <SheetDescription class="sr-only">{{ t('layout.nav.primaryAria') }}</SheetDescription>
          </SheetHeader>
          <div class="flex flex-col gap-4 overflow-y-auto">
            <div v-for="mod in topNavModules" :key="mod.id" class="space-y-2">
              <RouterLink
                :to="moduleDefaultPath(mod)"
                class="text-muted-foreground hover:text-foreground flex items-center gap-2 text-xs font-medium tracking-wide uppercase no-underline"
                @click="mobileNavOpen = false"
              >
                <component :is="topNavModuleIcons[mod.id]" class="size-3.5 shrink-0" />
                {{ t(mod.labelKey) }}
              </RouterLink>
              <div class="flex flex-col gap-1 pl-1">
                <RouterLink
                  v-for="item in mod.items"
                  :key="item.to"
                  :to="item.to"
                  class="hover:bg-accent flex items-center gap-2 rounded-md px-2 py-2 text-sm"
                  :class="route.path === item.to ? 'bg-accent' : ''"
                  @click="mobileNavOpen = false"
                >
                  <component :is="item.icon" class="size-4 shrink-0 opacity-70" />
                  {{ t(item.labelKey) }}
                </RouterLink>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Button variant="ghost" size="icon" class="h-9 w-9" :aria-label="themeLabel" @click="toggleTheme">
        <Moon v-if="!isDark" class="size-4" />
        <Sun v-else class="size-4" />
      </Button>

      <Button variant="ghost" size="icon" class="h-9 w-9" as-child>
        <a :href="SITE_GITHUB_URL" target="_blank" rel="noopener noreferrer" :aria-label="t('layout.nav.github')">
          <Github class="size-4" />
        </a>
      </Button>

      <Button variant="ghost" size="icon" class="h-9 w-9" :aria-label="t('layout.nav.locale')" @click="cycleLocale">
        <Languages class="size-4" />
      </Button>

      <!-- 已登录：显示用户头像和下拉菜单 -->
      <template v-if="isLoggedIn">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon" class="h-9 w-9 rounded-full">
              <Avatar size="sm">
                <AvatarImage :alt="userAvatarAlt" :src="userAvatarSrc" />
                <AvatarFallback class="text-xs font-medium">
                  {{ userStore.userInfo?.nickname?.charAt(0)?.toUpperCase() || 'U' }}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @select="goToProfile">
              <User class="size-4" />
              {{ t('layout.nav.userMenu.profile') }}
            </DropdownMenuItem>
            <DropdownMenuItem @select="goToChangePassword">
              <KeyRound class="size-4" />
              {{ t('layout.nav.userMenu.changePassword') }}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @select="handleLogout">
              <LogOut class="size-4" />
              {{ t('layout.nav.userMenu.logout') }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </template>

      <!-- 未登录：显示登录按钮 -->
      <template v-else>
        <Button variant="ghost" size="sm" class="hidden h-9 gap-1 px-2 sm:inline-flex" as-child>
          <RouterLink to="/user/login" class="flex items-center gap-1">
            <LogIn class="size-4" />
            <span class="max-w-[4.5rem] truncate text-xs">{{ t('layout.nav.userLogin') }}</span>
          </RouterLink>
        </Button>
        <Button variant="ghost" size="icon" class="h-9 w-9 sm:hidden" as-child>
          <RouterLink to="/user/login" :aria-label="t('layout.nav.userLogin')">
            <LogIn class="size-4" />
          </RouterLink>
        </Button>
      </template>
    </div>
  </header>
</template>
