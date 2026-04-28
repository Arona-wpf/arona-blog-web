<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { Separator } from '@/components/ui/separator'

const { t } = useI18n()

const frontendVersion = '26.4.28'
const backendVersion = '26.4.28'

const frontendTechStack = [
  { name: 'Vue 3', version: '3.5.32', descriptionKey: 'views.about.techStack.vue3' },
  { name: 'Vue Router', version: '5.0.4', descriptionKey: 'views.about.techStack.vueRouter' },
  { name: 'Pinia', version: '3.0.4', descriptionKey: 'views.about.techStack.pinia' },
  { name: 'TypeScript', version: '5.9.3', descriptionKey: 'views.about.techStack.typescript' },
  { name: 'Tailwind CSS', version: '4.2.2', descriptionKey: 'views.about.techStack.tailwind' },
  { name: 'Vite', version: '8.0.3', descriptionKey: 'views.about.techStack.vite' },
  { name: 'vue-i18n', version: '11.3.0', descriptionKey: 'views.about.techStack.vueI18n' },
  { name: 'Reka UI', version: '2.9.3', descriptionKey: 'views.about.techStack.rekaUi' },
  { name: 'Lucide Vue', version: '1.0.0', descriptionKey: 'views.about.techStack.lucideVue' },
  { name: 'Axios', version: '1.14.0', descriptionKey: 'views.about.techStack.axios' },
  { name: 'VeeValidate', version: '4.15.1', descriptionKey: 'views.about.techStack.veeValidate' },
  { name: 'Zod', version: '4.3.6', descriptionKey: 'views.about.techStack.zod' }
]

const backendTechStack = [
  { name: 'Midway.js', version: '3.20.22', descriptionKey: 'views.about.techStack.midway' },
  { name: 'Mongoose', version: '8.23.0', descriptionKey: 'views.about.techStack.mongoose' },
  { name: 'MongoDB', version: '7.0.28', descriptionKey: 'views.about.techStack.mongodb' },
  { name: 'Redis', version: '8.2.3', descriptionKey: 'views.about.techStack.redis' },
  { name: 'sm-crypto', version: '0.4.0', descriptionKey: 'views.about.techStack.smCrypto' },
  { name: 'cos-nodejs-sdk-v5', version: '2.15.4', descriptionKey: 'views.about.techStack.cosNodejsSdk' },
  { name: 'qcloud-cos-sts', version: '3.1.3', descriptionKey: 'views.about.techStack.qcloudCosSts' },
  { name: 'archiver', version: '7.0.1', descriptionKey: 'views.about.techStack.archiver' },
  { name: 'TypeScript', version: '5.9.3', descriptionKey: 'views.about.techStack.typescript' }
]

const mainDependencies = computed(() => [...frontendTechStack, ...backendTechStack.slice(0, 3)])
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6 px-4">
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
        {{ t('views.about.background.content2') }}
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
            <p class="text-xs text-muted-foreground mt-1">{{ t(tech.descriptionKey) }}</p>
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
            <p class="text-xs text-muted-foreground mt-1">{{ t(tech.descriptionKey) }}</p>
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
              <th class="px-4 py-2 text-left font-medium">{{ t('views.about.dependencies.name') }}</th>
              <th class="px-4 py-2 text-left font-medium">{{ t('views.about.dependencies.version') }}</th>
              <th class="px-4 py-2 text-left font-medium">{{ t('views.about.dependencies.usage') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="dep in mainDependencies" :key="dep.name" class="hover:bg-accent/30">
              <td class="px-4 py-2 font-medium">{{ dep.name }}</td>
              <td class="px-4 py-2 text-muted-foreground">{{ dep.version }}</td>
              <td class="px-4 py-2 text-muted-foreground">{{ t(dep.descriptionKey) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
