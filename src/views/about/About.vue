<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { Separator } from '@/components/ui/separator'

const { t } = useI18n()

const frontendVersion = '26.4.27'
const backendVersion = '26.4.27'

const frontendTechStack = [
  { name: 'Vue 3', version: '3.5.32', description: '渐进式JavaScript框架' },
  { name: 'Vue Router', version: '5.0.4', description: '官方路由管理器' },
  { name: 'Pinia', version: '3.0.4', description: '状态管理' },
  { name: 'TypeScript', version: '5.9.3', description: '类型安全' },
  { name: 'Tailwind CSS', version: '4.2.2', description: '原子化CSS框架' },
  { name: 'Vite', version: '8.0.3', description: '构建工具' },
  { name: 'vue-i18n', version: '11.3.0', description: '国际化' },
  { name: 'Reka UI', version: '2.9.3', description: '无样式组件库' },
  { name: 'Lucide Vue', version: '1.0.0', description: '图标库' },
  { name: 'Axios', version: '1.14.0', description: 'HTTP客户端' },
  { name: 'VeeValidate', version: '4.15.1', description: '表单验证' },
  { name: 'Zod', version: '4.3.6', description: 'Schema验证' }
]

const backendTechStack = [
  { name: 'Midway.js', version: 'latest', description: 'Node.js Web框架' },
  { name: 'TypeORM', version: 'latest', description: 'ORM框架' },
  { name: 'MySQL', version: '8.x', description: '数据库' },
  { name: 'Redis', version: '7.x', description: '缓存' },
  { name: 'TypeScript', version: '5.9.3', description: '类型安全' }
]

const mainDependencies = computed(() => [...frontendTechStack, ...backendTechStack.slice(0, 3)])
</script>

<template>
  <div class="max-w-3xl space-y-6">
    <!-- 标题 -->
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.about.title') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('views.about.description') }}</p>
    </div>

    <Separator />

    <!-- 网站背景 -->
    <section class="space-y-3">
      <h2 class="text-xl font-medium">{{ t('views.about.background.title') }}</h2>
      <p class="text-muted-foreground leading-relaxed">
        {{ t('views.about.background.content') }}
      </p>
      <p class="text-muted-foreground leading-relaxed">
        本站旨在为用户提供便捷的在线工具和游戏数据分析服务。网站采用前后端分离架构，前端使用Vue 3 +
        TypeScript开发，后端基于Midway.js框架构建，数据存储采用MySQL数据库，Redis用于缓存和会话管理。
      </p>
    </section>

    <Separator />

    <!-- 版本信息 -->
    <section class="space-y-3">
      <h2 class="text-xl font-medium">{{ t('views.about.version.title') }}</h2>
      <div class="grid gap-3 sm:grid-cols-2">
        <div class="rounded-lg border p-4">
          <div class="text-sm font-medium">{{ t('views.about.techStack.frontend') }}</div>
          <div class="text-2xl font-bold text-primary">{{ frontendVersion }}</div>
        </div>
        <div class="rounded-lg border p-4">
          <div class="text-sm font-medium">{{ t('views.about.techStack.backend') }}</div>
          <div class="text-2xl font-bold text-primary">{{ backendVersion }}</div>
        </div>
      </div>
    </section>

    <Separator />

    <!-- 技术栈 -->
    <section class="space-y-3">
      <h2 class="text-xl font-medium">{{ t('views.about.techStack.title') }}</h2>

      <!-- 前端技术栈 -->
      <div class="space-y-2">
        <h3 class="text-base font-medium text-muted-foreground">{{ t('views.about.techStack.frontend') }}</h3>
        <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="tech in frontendTechStack"
            :key="tech.name"
            class="rounded-lg border p-3 transition-colors hover:bg-accent/50"
          >
            <div class="flex items-center justify-between">
              <span class="font-medium">{{ tech.name }}</span>
              <span class="text-xs text-muted-foreground">v{{ tech.version }}</span>
            </div>
            <p class="text-xs text-muted-foreground mt-1">{{ tech.description }}</p>
          </div>
        </div>
      </div>

      <!-- 后端技术栈 -->
      <div class="space-y-2">
        <h3 class="text-base font-medium text-muted-foreground">{{ t('views.about.techStack.backend') }}</h3>
        <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="tech in backendTechStack"
            :key="tech.name"
            class="rounded-lg border p-3 transition-colors hover:bg-accent/50"
          >
            <div class="flex items-center justify-between">
              <span class="font-medium">{{ tech.name }}</span>
              <span class="text-xs text-muted-foreground">v{{ tech.version }}</span>
            </div>
            <p class="text-xs text-muted-foreground mt-1">{{ tech.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <Separator />

    <!-- 主要依赖 -->
    <section class="space-y-3">
      <h2 class="text-xl font-medium">{{ t('views.about.dependencies.title') }}</h2>
      <div class="rounded-lg border overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-muted/50">
            <tr>
              <th class="px-4 py-2 text-left font-medium">依赖名称</th>
              <th class="px-4 py-2 text-left font-medium">版本</th>
              <th class="px-4 py-2 text-left font-medium">用途</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="dep in mainDependencies" :key="dep.name" class="hover:bg-accent/30">
              <td class="px-4 py-2 font-medium">{{ dep.name }}</td>
              <td class="px-4 py-2 text-muted-foreground">{{ dep.version }}</td>
              <td class="px-4 py-2 text-muted-foreground">{{ dep.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
