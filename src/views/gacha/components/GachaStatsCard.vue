<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import gachaBaseMap from '@/assets/png/gacha_zzz_base_map.png'
import type { IGachaGoldPulls, IGachaStats, IGachaTimeRange } from '@/definitions/types/gacha.types'

const props = defineProps<{
  title: string
  stats: IGachaStats
  timeRange?: IGachaTimeRange | null
  tag?: string
  goldRecordsWithPulls?: IGachaGoldPulls[]
  goldRankType?: string
  needBaseMapTypes?: string[]
}>()

const { t } = useI18n()

const avgPerGoldDisplay = computed(() => {
  if (props.stats.goldCount === 0) return '-'
  return props.stats.avgPerGold
})

const avgPerGoldClass = computed(() => {
  if (props.stats.goldCount === 0) return ''
  const avg = parseFloat(props.stats.avgPerGold)
  if (avg > 60) return 'text-red-500'
  return 'text-green-500'
})

const goldRateDisplay = computed(() => {
  if (props.stats.totalPulls === 0) return '-'
  return props.stats.goldRate
})

const lastGoldName = computed(() => {
  if (!props.stats.lastGold) return '-'
  return props.stats.lastGold.item_name
})

const lastGoldTime = computed(() => {
  if (!props.stats.lastGold) return ''
  return new Date(props.stats.lastGold.gacha_time).toLocaleDateString()
})

const timeRangeDisplay = computed(() => {
  if (!props.timeRange || props.stats.totalPulls === 0) return ''
  const startDate = new Date(props.timeRange.start).toLocaleDateString()
  const endDate = new Date(props.timeRange.end).toLocaleDateString()
  return `${startDate} - ${endDate}`
})

// 过滤出有icon_url的5星/S级记录
const goldRecordsWithIcon = computed(() => {
  if (!props.goldRecordsWithPulls) return []
  const rankType = props.goldRankType || '5'
  return props.goldRecordsWithPulls.filter((item) => item.record.icon_url && item.record.rank_type === rankType)
})
</script>

<template>
  <div class="rounded-lg border bg-transparent p-4 space-y-3">
    <div class="flex items-start justify-between gap-2">
      <div class="font-semibold text-base">
        {{ props.title }}
        <span v-if="timeRangeDisplay" class="text-muted-foreground text-sm font-normal ml-2">{{
          timeRangeDisplay
        }}</span>
      </div>
      <span v-if="props.tag" class="text-xs px-2 py-1 rounded bg-muted text-muted-foreground shrink-0">{{
        props.tag
      }}</span>
    </div>

    <div class="grid grid-cols-3 gap-2 text-sm">
      <div class="space-y-1">
        <div class="text-muted-foreground">{{ t('views.gacha.stats.totalPulls') }}</div>
        <div class="font-medium">{{ props.stats.totalPulls }}</div>
      </div>
      <div class="space-y-1">
        <div class="text-muted-foreground">{{ t('views.gacha.stats.goldCount') }}</div>
        <div class="font-medium text-yellow-500">{{ props.stats.goldCount }}</div>
      </div>
      <div class="space-y-1">
        <div class="text-muted-foreground">{{ t('views.gacha.stats.pityCount') }}</div>
        <div class="font-medium text-blue-500">{{ props.stats.pityCount }}</div>
      </div>
      <div class="space-y-1">
        <div class="text-muted-foreground">{{ t('views.gacha.stats.avgPerGold') }}</div>
        <div class="font-medium" :class="avgPerGoldClass">{{ avgPerGoldDisplay }}</div>
      </div>
      <div class="space-y-1">
        <div class="text-muted-foreground">{{ t('views.gacha.stats.goldRate') }}</div>
        <div class="font-medium">{{ goldRateDisplay }}</div>
      </div>
      <div class="space-y-1">
        <div class="text-muted-foreground">
          {{ t('views.gacha.stats.lastGold') }}
          <span v-if="props.stats.lastGold" class="text-xs ml-1">({{ lastGoldTime }})</span>
        </div>
        <div class="font-medium text-yellow-500 truncate" :title="lastGoldName">{{ lastGoldName }}</div>
      </div>
    </div>

    <!-- 5星角色图片展示 -->
    <div v-if="goldRecordsWithIcon.length > 0" class="flex flex-wrap gap-2 pt-2">
      <div v-for="item in goldRecordsWithIcon" :key="item.record.gacha_id" class="flex flex-col items-center">
        <div class="relative w-16 h-16">
          <img
            v-if="props.needBaseMapTypes?.includes(item.record.item_type)"
            :src="gachaBaseMap"
            alt="base"
            class="absolute inset-0 w-full h-full rounded object-cover"
          />
          <img
            :src="item.record.icon_url"
            :alt="item.record.item_name"
            :title="item.record.item_name"
            class="relative w-full h-full rounded object-cover"
          />
        </div>
        <span class="text-sm text-yellow-500 font-medium">{{ item.pulls }}</span>
      </div>
    </div>
  </div>
</template>
