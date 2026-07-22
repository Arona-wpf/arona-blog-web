<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { pu_v1_system_dependencies, pu_v1_system_version } from '@/fetch/system'

import pkg from '../../../package.json'

const { t } = useI18n()

const frontendVersion = pkg.version
const backendVersion = ref('?')
const backendDependencies = ref<{ name: string; version: string }[]>([])
const backendFetchError = ref(false)

// 从 package.json 提取依赖版本
const getDependencyVersion = (name: string): string => {
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies } as Record<string, string>
  const version = allDeps[name]
  if (!version) return '?'
  // 移除版本前缀符号（^, ~等）
  return version.replace(/^[\^~>=<]+/, '')
}

onMounted(async () => {
  try {
    const res = await pu_v1_system_version()
    if (res.data?.version) {
      backendVersion.value = res.data.version
    }
  } catch {
    backendVersion.value = '?'
  }

  try {
    const res = await pu_v1_system_dependencies()
    if (res.data?.dependencies) {
      backendDependencies.value = res.data.dependencies
      backendFetchError.value = false
    }
  } catch {
    backendDependencies.value = []
    backendFetchError.value = true
  }
})

// 前端依赖（从 package.json 自动生成）
const frontendDependencies = computed(() => {
  const deps = pkg.dependencies as Record<string, string>
  const devDeps = pkg.devDependencies as Record<string, string>

  const dependencies: { name: string; version: string }[] = []

  // 添加生产依赖
  Object.keys(deps).forEach((name) => {
    dependencies.push({
      name,
      version: getDependencyVersion(name)
    })
  })

  // 添加开发依赖
  Object.keys(devDeps).forEach((name) => {
    dependencies.push({
      name,
      version: getDependencyVersion(name)
    })
  })

  return dependencies.sort((a, b) => a.name.localeCompare(b.name))
})

// 后端依赖（从接口获取）
const backendDependenciesList = computed(() => {
  return backendDependencies.value
    .map((dep) => ({
      name: dep.name,
      version: dep.version
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
})
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
          <div class="text-sm font-medium">{{ t('views.about.version.frontend') }}</div>
          <div class="text-2xl font-bold text-primary">{{ frontendVersion }}</div>
        </div>
        <div class="rounded-lg border p-4">
          <div class="text-sm font-medium">{{ t('views.about.version.backend') }}</div>
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
        <div class="rounded-lg border">
          <Table class="max-h-96">
            <TableHeader class="sticky top-0 bg-muted z-10">
              <TableRow>
                <TableHead>
                  {{ t('views.about.dependencies.name') }}
                </TableHead>
                <TableHead>
                  {{ t('views.about.dependencies.version') }}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="dep in frontendDependencies" :key="dep.name">
                <TableCell class="font-medium">{{ dep.name }}</TableCell>
                <TableCell class="text-muted-foreground">{{ dep.version }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <!-- 后端技术栈 -->
      <div class="space-y-2">
        <h3 class="text-base font-medium text-muted-foreground">{{ t('views.about.techStack.backend') }}</h3>
        <div class="rounded-lg border">
          <Table class="max-h-96">
            <TableHeader class="sticky top-0 bg-muted z-10">
              <TableRow>
                <TableHead>
                  {{ t('views.about.dependencies.name') }}
                </TableHead>
                <TableHead>
                  {{ t('views.about.dependencies.version') }}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <template v-if="backendFetchError">
                <TableRow>
                  <TableCell colspan="2">
                    <TableEmpty>
                      <p class="text-sm text-muted-foreground">{{ t('views.about.backendError') }}</p>
                    </TableEmpty>
                  </TableCell>
                </TableRow>
              </template>
              <template v-else>
                <TableRow v-for="dep in backendDependenciesList" :key="dep.name">
                  <TableCell class="font-medium">{{ dep.name }}</TableCell>
                  <TableCell class="text-muted-foreground">{{ dep.version }}</TableCell>
                </TableRow>
              </template>
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  </div>
</template>
