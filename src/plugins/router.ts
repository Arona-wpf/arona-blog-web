import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import AppLayout from '@/components/layout/AppLayout.vue'
import SectionOutlet from '@/components/layout/SectionOutlet.vue'
import { ResponseCodeEnum } from '@/definitions/enums/request.enums'
import { pu_v1_user_status } from '@/fetch/user'
import NProgress from '@/lib/nprogress'
import { useUserStore } from '@/stores/user'

/** 忘记密码路由（动态管理） */
const resetPasswordRoute: RouteRecordRaw = {
  path: '/user/reset',
  name: 'reset-password',
  component: () => import('@/views/user/reset/index.vue'),
  meta: { titleKey: 'views.user.resetPassword.title', hideSidebar: true, guestOnly: true }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/content', redirect: '/text/articles' },
    { path: '/content/articles', redirect: '/text/articles' },
    { path: '/content/categories', redirect: '/text/categories' },
    {
      path: '/',
      name: 'app-layout',
      component: AppLayout,
      children: [
        { path: '', name: 'develop', redirect: '/develop/password' },
        {
          path: 'develop',
          component: SectionOutlet,
          meta: {
            sidebarNav: [
              { to: '/develop/password', labelKey: 'layout.nav.sub.devPassword' },
              { to: '/develop/nanoid', labelKey: 'layout.nav.sub.devNanoid' },
              { to: '/develop/json', labelKey: 'layout.nav.sub.devJson' }
            ]
          },
          children: [
            { path: '', redirect: 'password' },
            {
              path: 'password',
              component: () => import('@/views/develop/DevelopPassword.vue'),
              meta: { titleKey: 'views.dev.password.title' }
            },
            {
              path: 'nanoid',
              component: () => import('@/views/develop/DevelopNanoid.vue'),
              meta: { titleKey: 'views.dev.nanoid.title' }
            },
            {
              path: 'json',
              component: () => import('@/views/develop/DevelopJson.vue'),
              meta: { titleKey: 'views.dev.json.title' }
            }
          ]
        },
        {
          path: 'crypto',
          component: SectionOutlet,
          meta: {
            sidebarNav: [
              { to: '/crypto/hash', labelKey: 'layout.nav.sub.cryptoHash' },
              { to: '/crypto/symmetric', labelKey: 'layout.nav.sub.cryptoSymmetric' }
            ]
          },
          children: [
            { path: '', redirect: 'hash' },
            {
              path: 'hash',
              component: () => import('@/views/crypto/CryptoHash.vue'),
              meta: { titleKey: 'views.crypto.hash.title' }
            },
            {
              path: 'symmetric',
              component: () => import('@/views/crypto/CryptoSymmetric.vue'),
              meta: { titleKey: 'views.crypto.symmetric.title' }
            }
          ]
        },
        {
          path: 'time',
          component: SectionOutlet,
          meta: {
            sidebarNav: [
              { to: '/time/world', labelKey: 'layout.nav.sub.timeWorld' },
              { to: '/time/timestamp', labelKey: 'layout.nav.sub.timeTimestamp' }
            ]
          },
          children: [
            { path: '', redirect: 'world' },
            {
              path: 'world',
              component: () => import('@/views/time/TimeWorld.vue'),
              meta: { titleKey: 'views.time.world.title' }
            },
            {
              path: 'timestamp',
              component: () => import('@/views/time/TimeTimestamp.vue'),
              meta: { titleKey: 'views.time.timestamp.title' }
            }
          ]
        },
        {
          path: 'text',
          component: SectionOutlet,
          meta: {
            sidebarNav: [
              { to: '/text/articles', labelKey: 'layout.nav.sub.textArticles' },
              { to: '/text/categories', labelKey: 'layout.nav.sub.textCategories' }
            ]
          },
          children: [
            { path: '', redirect: 'articles' },
            {
              path: 'articles',
              component: () => import('@/views/content/ContentArticles.vue'),
              meta: { titleKey: 'views.text.articles.title' }
            },
            {
              path: 'categories',
              component: () => import('@/views/content/ContentCategories.vue'),
              meta: { titleKey: 'views.text.categories.title' }
            }
          ]
        },
        {
          path: 'gacha',
          component: SectionOutlet,
          meta: {
            sidebarNav: [
              { to: '/gacha/genshin', labelKey: 'layout.nav.sub.gachaGenshin' },
              { to: '/gacha/starrail', labelKey: 'layout.nav.sub.gachaStarRail' },
              { to: '/gacha/zzz', labelKey: 'layout.nav.sub.gachaZZZ' }
            ],
            authOnly404: true
          },
          children: [
            { path: '', redirect: 'genshin' },
            {
              path: 'genshin',
              component: () => import('@/views/gacha/GachaGenshin.vue'),
              meta: { titleKey: 'views.gacha.genshin.title' }
            },
            {
              path: 'starrail',
              component: () => import('@/views/gacha/GachaStarRail.vue'),
              meta: { titleKey: 'views.gacha.starrail.title' }
            },
            {
              path: 'zzz',
              component: () => import('@/views/gacha/GachaZZZ.vue'),
              meta: { titleKey: 'views.gacha.zzz.title' }
            }
          ]
        },
        {
          path: 'about',
          component: () => import('@/views/about/About.vue'),
          meta: { titleKey: 'views.about.title', hideSidebar: true }
        },
        {
          path: 'user/login',
          component: () => import('@/views/user/login/index.vue'),
          meta: { titleKey: 'views.user.login.title', hideSidebar: true, guestOnly: true }
        },
        {
          path: 'user/register',
          component: () => import('@/views/user/register/index.vue'),
          meta: { titleKey: 'views.user.register.title', hideSidebar: true, guestOnly: true }
        },
        {
          path: 'user/reset-password',
          redirect: '/user/reset'
        },
        {
          path: 'user/profile',
          component: () => import('@/views/user/profile/index.vue'),
          meta: { titleKey: 'views.user.profile.title', hideSidebar: true, requireAuth: true }
        },
        {
          path: 'user/password',
          component: () => import('@/views/user/password/index.vue'),
          meta: { titleKey: 'views.user.password.title', hideSidebar: true, requireAuth: true }
        },
        // 404 catch-all 路由
        {
          path: ':pathMatch(.*)*',
          name: 'not-found',
          component: () => import('@/views/error/NotFound.vue'),
          meta: { titleKey: 'views.error.notFound.title', hideSidebar: true }
        }
      ]
    }
  ]
})

// 初始化时默认添加忘记密码路由（假设未登录状态）
router.addRoute('app-layout', resetPasswordRoute)

/** 更新忘记密码路由（根据登录状态动态添加/删除） */
export function updateResetPasswordRoute(isLoggedIn: boolean) {
  const routeExists = router.hasRoute('reset-password')
  if (isLoggedIn && routeExists) {
    // 已登录：删除忘记密码路由
    router.removeRoute('reset-password')
  } else if (!isLoggedIn && !routeExists) {
    // 未登录：添加忘记密码路由到 AppLayout 下
    router.addRoute('app-layout', resetPasswordRoute)
  }
}

router.beforeEach(async (to) => {
  NProgress.start()

  const userStore = useUserStore()

  if (!userStore.isLoggedIn()) {
    try {
      const res = await pu_v1_user_status()
      if (res.code === ResponseCodeEnum.SUCCESS && res.data) {
        userStore.setUserInfo(res.data)
      } else {
        userStore.clearUserInfo()
      }
    } catch {
      userStore.clearUserInfo()
    }
  }

  // 根据登录状态更新忘记密码路由
  updateResetPasswordRoute(userStore.isLoggedIn())

  // 已登录用户访问登录/注册页，跳转到个人资料页
  if (to.meta.guestOnly && userStore.isLoggedIn()) {
    return { path: '/user/profile' }
  }

  // 检查是否需要登录
  if (to.meta.requireAuth) {
    if (!userStore.userInfo) {
      // 未登录，跳转到登录页并记录目标路径
      return {
        path: '/user/login',
        query: { redirect: to.fullPath }
      }
    }
  }

  // 检查是否需要登录才能访问（未登录跳404）
  if (to.meta.authOnly404 && !userStore.isLoggedIn()) {
    // 未登录，跳转到404页面
    return { name: 'not-found' }
  }
})

router.afterEach(() => {
  NProgress.done()
})

export default router
