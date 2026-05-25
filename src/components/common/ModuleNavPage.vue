<script setup lang="ts">
import { type Component, computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { Button } from '@/components/ui/button'

interface FeatureItem {
  path: string
  titleKey: string
  descriptionKey: string
  icon?: Component | string
}

interface Props {
  moduleTitleKey: string
  moduleDescriptionKey: string
  features: FeatureItem[]
}

const props = defineProps<Props>()
const { t } = useI18n()

const moduleTitle = computed(() => t(props.moduleTitleKey))
const moduleDescription = computed(() => t(props.moduleDescriptionKey))
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">{{ moduleTitle }}</h1>
      <p class="text-muted-foreground text-sm">{{ moduleDescription }}</p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <RouterLink v-for="feature in features" :key="feature.path" :to="feature.path" class="group">
        <div
          class="flex flex-col gap-3 rounded-lg border bg-transparent p-4 transition-all hover:border-primary hover:shadow-md h-full"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <img v-if="typeof feature.icon === 'string'" :src="feature.icon" class="size-5 shrink-0" />
              <component v-else :is="feature.icon" class="size-5 shrink-0 text-muted-foreground" />
              <h3 class="font-medium">{{ t(feature.titleKey) }}</h3>
            </div>
            <span class="text-muted-foreground text-xs transition-transform group-hover:translate-x-1"> → </span>
          </div>
          <p class="text-muted-foreground text-sm line-clamp-2">
            {{ t(feature.descriptionKey) }}
          </p>
          <Button variant="outline" size="sm" class="mt-auto self-start">
            {{ t('layout.nav.module.goToFeature') }}
          </Button>
        </div>
      </RouterLink>
    </div>
  </div>
</template>
