import { createRouter, createWebHistory } from 'vue-router'

import AppLayout from '@/layouts/AppLayout.vue'
import SectionOutlet from '@/layouts/SectionOutlet.vue'
import NProgress from '@/lib/nprogress'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/workspace', redirect: '/dev/overview' },
    { path: '/workspace/overview', redirect: '/dev/overview' },
    { path: '/workspace/tasks', redirect: '/dev/tasks' },
    { path: '/content', redirect: '/text/articles' },
    { path: '/content/articles', redirect: '/text/articles' },
    { path: '/content/categories', redirect: '/text/categories' },
    {
      path: '/',
      component: AppLayout,
      children: [
        { path: '', redirect: '/dev/overview' },
        {
          path: 'dev',
          component: SectionOutlet,
          meta: {
            sidebarNav: [
              { to: '/dev/overview', labelKey: 'layout.nav.sub.devOverview' },
              { to: '/dev/tasks', labelKey: 'layout.nav.sub.devTasks' }
            ]
          },
          children: [
            { path: '', redirect: 'overview' },
            {
              path: 'overview',
              component: () => import('@/views/workspace/WorkspaceOverview.vue'),
              meta: { titleKey: 'views.dev.overview.title' }
            },
            {
              path: 'tasks',
              component: () => import('@/views/workspace/WorkspaceTasks.vue'),
              meta: { titleKey: 'views.dev.tasks.title' }
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
          path: 'other',
          component: SectionOutlet,
          meta: {
            sidebarNav: [
              { to: '/other/links', labelKey: 'layout.nav.sub.otherLinks' },
              { to: '/other/about', labelKey: 'layout.nav.sub.otherAbout' }
            ]
          },
          children: [
            { path: '', redirect: 'links' },
            {
              path: 'links',
              component: () => import('@/views/other/OtherLinks.vue'),
              meta: { titleKey: 'views.other.links.title' }
            },
            {
              path: 'about',
              component: () => import('@/views/other/OtherAbout.vue'),
              meta: { titleKey: 'views.other.about.title' }
            }
          ]
        },
        {
          path: 'user/login',
          component: () => import('@/views/user/login/index.vue'),
          meta: { titleKey: 'views.user.login.title', hideSidebar: true }
        },
        {
          path: 'user/register',
          component: () => import('@/views/user/register/index.vue'),
          meta: { titleKey: 'views.user.register.title', hideSidebar: true }
        },
        {
          path: 'user/reset',
          component: () => import('@/views/user/reset/index.vue'),
          meta: { titleKey: 'views.user.resetPassword.title', hideSidebar: true }
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
        }
      ]
    }
  ]
})

router.beforeEach((to) => {
  NProgress.start()

  // 检查是否需要登录
  if (to.meta.requireAuth) {
    const userStore = useUserStore()
    if (!userStore.userInfo) {
      // 未登录，跳转到登录页并记录目标路径
      return {
        path: '/user/login',
        query: { redirect: to.fullPath }
      }
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})

export default router
