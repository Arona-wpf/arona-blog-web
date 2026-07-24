<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import gachaBaseMap from '@/assets/png/gacha_zzz_base_map.png'
import { Image } from '@/components/ui/image'
import type { IGachaGoldPulls, IGachaStats, IGachaTimeRange } from '@/definitions/types/gacha.types'

const props = defineProps<{
  title: string
  stats: IGachaStats
  timeRange?: IGachaTimeRange | null
  tag?: string
  goldRecordsWithPulls?: IGachaGoldPulls[]
  goldRankType?: string
  needBaseMapTypes?: string[]
  /** 是否为限定池（显示UP相关统计） */
  isLimitedPool?: boolean
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

const goldRateClass = computed(() => {
  if (props.stats.totalPulls === 0) return ''
  const rate = parseFloat(props.stats.goldRate)
  if (rate >= 1.6) return 'text-green-500'
  return 'text-yellow-500'
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

// 过滤出 5 星/S 级记录（绝区零历史数据可能仍为 "4"），图片缺失时由 Image 组件展示兜底图
const goldRecordsWithIcon = computed(() => {
  if (!props.goldRecordsWithPulls) return []
  const rankType = props.goldRankType || '5'
  return props.goldRecordsWithPulls.filter((item) => {
    if (item.record.rank_type === rankType) return true
    return rankType === 'S' && item.record.rank_type === '4'
  })
})

const upAvgPerGoldDisplay = computed(() => {
  if (!props.isLimitedPool || props.stats.upGoldCount === 0) return '-'
  return props.stats.upAvgPerGold
})

const upAvgPerGoldClass = computed(() => {
  if (!props.isLimitedPool || props.stats.upGoldCount === 0) return ''
  const avg = parseFloat(props.stats.upAvgPerGold)
  if (avg > 60) return 'text-red-500'
  return 'text-green-500'
})

const upGoldRateDisplay = computed(() => {
  if (!props.isLimitedPool || props.stats.totalPulls === 0) return '-'
  return props.stats.upGoldRate
})

const upGoldRateClass = computed(() => {
  if (!props.isLimitedPool || props.stats.totalPulls === 0) return ''
  const rate = parseFloat(props.stats.upGoldRate)
  if (rate >= 0.8) return 'text-green-500'
  return 'text-yellow-500'
})

const upProbabilityDisplay = computed(() => {
  if (!props.isLimitedPool || props.stats.goldCount === 0) return '-'
  return props.stats.upProbability
})

const upProbabilityClass = computed(() => {
  if (!props.isLimitedPool || props.stats.goldCount === 0) return ''
  const prob = parseFloat(props.stats.upProbability)
  if (prob >= 60) return 'text-green-500'
  return 'text-orange-500'
})

const pityStatusLabel = computed(() => {
  if (!props.isLimitedPool || !props.stats.pityStatus) return ''
  return props.stats.pityStatus === 'big'
    ? t('views.gacha.stats.pityStatusBig')
    : t('views.gacha.stats.pityStatusSmall')
})
</script>

<template>
  <div class="rounded-lg border bg-transparent p-4 space-y-3">
    <div class="flex items-start justify-between gap-2">
      <div class="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
        <div class="font-semibold text-base">{{ props.title }}</div>
        <span v-if="timeRangeDisplay" class="text-muted-foreground text-sm font-normal shrink-0">{{
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
        <div class="text-muted-foreground">
          {{ t('views.gacha.stats.pityCount') }}
          <span v-if="props.isLimitedPool && props.stats.pityStatus" class="text-xs ml-1">({{ pityStatusLabel }})</span>
        </div>
        <div class="font-medium text-blue-500">{{ props.stats.pityCount }}</div>
      </div>
      <div class="space-y-1">
        <div class="text-muted-foreground">{{ t('views.gacha.stats.avgPerGold') }}</div>
        <div class="font-medium" :class="avgPerGoldClass">{{ avgPerGoldDisplay }}</div>
      </div>
      <div class="space-y-1">
        <div class="text-muted-foreground">{{ t('views.gacha.stats.goldRate') }}</div>
        <div class="font-medium" :class="goldRateClass">{{ goldRateDisplay }}</div>
      </div>
      <div class="space-y-1">
        <div class="text-muted-foreground">
          {{ t('views.gacha.stats.lastGold') }}
          <span v-if="props.stats.lastGold" class="text-xs ml-1">({{ lastGoldTime }})</span>
        </div>
        <div class="font-medium text-yellow-500 break-words">{{ lastGoldName }}</div>
      </div>
      <!-- UP出金统计（仅限定池显示） -->
      <div v-if="props.isLimitedPool" class="space-y-1">
        <div class="text-muted-foreground">{{ t('views.gacha.stats.upAvgPerGold') }}</div>
        <div class="font-medium" :class="upAvgPerGoldClass">{{ upAvgPerGoldDisplay }}</div>
      </div>
      <div v-if="props.isLimitedPool" class="space-y-1">
        <div class="text-muted-foreground">{{ t('views.gacha.stats.upGoldRate') }}</div>
        <div class="font-medium" :class="upGoldRateClass">{{ upGoldRateDisplay }}</div>
      </div>
      <div v-if="props.isLimitedPool" class="space-y-1">
        <div class="text-muted-foreground">
          {{ t('views.gacha.stats.upProbability') }}
          <span v-if="props.stats.goldCount > 0" class="text-xs ml-1">({{ props.stats.upGoldCount }})</span>
        </div>
        <div class="font-medium" :class="upProbabilityClass">{{ upProbabilityDisplay }}</div>
      </div>
    </div>

    <!-- 5星角色图片展示 -->
    <div v-if="goldRecordsWithIcon.length > 0" class="flex flex-wrap gap-2 pt-2">
      <div v-for="item in goldRecordsWithIcon" :key="item.record.gacha_id" class="flex flex-col items-center">
        <div class="relative size-18">
          <img
            v-if="props.needBaseMapTypes?.includes(item.record.item_type)"
            :src="gachaBaseMap"
            alt="base"
            class="absolute inset-0 size-full rounded object-cover"
          />
          <Image
            :src="item.record.icon_url"
            :alt="item.record.item_name"
            :title="item.record.item_name"
            class="relative rounded"
          />
        </div>
        <span class="text-sm text-yellow-500 font-medium">{{ item.pulls }}</span>
      </div>
    </div>
  </div>
</template>
