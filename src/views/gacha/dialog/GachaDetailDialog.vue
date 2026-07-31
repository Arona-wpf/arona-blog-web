<script setup lang="ts">
import dayjs from 'dayjs'
import type { EChartsOption } from 'echarts'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Dialog, DialogContent, DialogHeader, DialogScrollBody, DialogTitle } from '@/components/ui/dialog'
import { ECharts } from '@/components/ui/echarts'
import { GACHA_COST_PER_PULL } from '@/definitions/constants/gacha.constants'
import { GameTypeEnum } from '@/definitions/enums/gacha.enum'
import type { IGachaGoldPulls } from '@/definitions/types/gacha.types'
import type { GachaRecord } from '@/fetch/gacha/types'

const props = defineProps<{
  open: boolean
  title: string
  allRecords: GachaRecord[]
  goldRecordsWithPulls: IGachaGoldPulls[]
  permanentItemIds: string[]
  goldRankType: string
  gameType?: string
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const { t } = useI18n()

// Date range state, default to last 6 months
const dateRange = ref<{ start: Date; end: Date } | null>(null)

onMounted(() => {
  const records = props.allRecords
  if (records.length > 0) {
    const times = records.map((r) => r.gacha_time)
    const minTime = Math.min(...times)
    const maxTime = Math.max(...times)
    const sixMonthsAgo = dayjs(maxTime).subtract(6, 'month').valueOf()
    dateRange.value = {
      start: new Date(Math.max(minTime, sixMonthsAgo)),
      end: new Date(maxTime)
    }
  }
})

// Currency name based on game type
const currencyName = computed(() => {
  switch (props.gameType) {
    case GameTypeEnum.GENSHIN_IMPACT:
      return t('views.gacha.stats.currencyGenshin')
    case GameTypeEnum.HONKAI_STAR_RAIL:
      return t('views.gacha.stats.currencyStarrail')
    case GameTypeEnum.ZENLESS_ZONE_ZERO:
      return t('views.gacha.stats.currencyZzz')
    default:
      return t('views.gacha.stats.currencyGenshin')
  }
})

const costPerPull = computed(() => {
  if (!props.gameType) return 160
  return GACHA_COST_PER_PULL[props.gameType as GameTypeEnum] ?? 160
})

// Line chart: monthly pull counts
const lineOption = computed<EChartsOption>(() => {
  const records = props.allRecords
  if (records.length === 0) return {}

  // Filter by date range
  let filtered = records
  if (dateRange.value) {
    const startTime = dateRange.value.start.getTime()
    const endTime = dateRange.value.end.getTime()
    filtered = records.filter((r) => r.gacha_time >= startTime && r.gacha_time <= endTime)
  }

  if (filtered.length === 0) return {}

  // Group by month (YYYY-MM)
  const monthMap = new Map<string, number>()
  filtered.forEach((r) => {
    const month = dayjs(r.gacha_time).format('YYYY-MM')
    monthMap.set(month, (monthMap.get(month) || 0) + 1)
  })

  // Sort months chronologically
  const months = Array.from(monthMap.keys()).sort()
  const counts = months.map((m) => monthMap.get(m) || 0)

  const pullsLabel = t('views.gacha.stats.pullsLabel')
  const costLabel = t('views.gacha.stats.estimatedCost', { currency: currencyName.value })
  const cost = costPerPull.value

  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params
        const month = p.name
        const pulls = p.value
        return `${month}<br/>${pullsLabel}: ${pulls}<br/>${costLabel}: ${pulls * cost}`
      }
    },
    grid: { left: 50, right: 20, top: 20, bottom: 50 },
    dataZoom:
      months.length > 12
        ? [
            { type: 'inside', start: 0, end: 100 },
            { type: 'slider', start: 0, end: 100, height: 20, bottom: 5 }
          ]
        : undefined,
    xAxis: {
      type: 'category',
      data: months,
      boundaryGap: false,
      axisLabel: {
        rotate: months.length > 8 ? 30 : 0
      }
    },
    yAxis: {
      type: 'value',
      name: pullsLabel,
      minInterval: 1
    },
    series: [
      {
        type: 'line',
        data: counts,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#6366F1', width: 2 },
        itemStyle: { color: '#6366F1' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(99, 102, 241, 0.3)' },
              { offset: 1, color: 'rgba(99, 102, 241, 0.02)' }
            ]
          }
        }
      }
    ]
  }
})

/** 柱状图颜色阈值 */
function getBarColor(pulls: number): string {
  if (pulls <= 50) return '#22C55E'
  if (pulls <= 75) return '#EAB308'
  return '#EF4444'
}

/** 柱状图数据（横向柱状图） */
const barOption = computed<EChartsOption>(() => {
  const goldPulls = props.goldRecordsWithPulls
  if (goldPulls.length === 0) return {}

  // 按时间倒序排列（新→旧，从上到下）
  const sorted = [...goldPulls]

  // 使用索引作为 category data，避免同名角色导致轴合并错位
  const categories = sorted.map((_, i) => `_${i}`)
  const values = sorted.map((g) => g.pulls)
  const colors = sorted.map((g) => getBarColor(g.pulls))

  // 动态 rich text styles：每个角色一个图片样式，key 使用索引避免重名冲突
  const richStyles: Record<string, object> = {}
  sorted.forEach((g, i) => {
    richStyles[`img_${i}`] = {
      backgroundColor: { image: g.record.icon_url },
      width: 28,
      height: 28,
      borderRadius: 4,
      align: 'center',
      verticalAlign: 'middle'
    }
  })

  // 判断歪的标记
  const isPity = (g: IGachaGoldPulls) => props.permanentItemIds.includes(g.record.item_id)

  const pityText = t('views.gacha.stats.pityLabel')

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params
        const idx = p.dataIndex
        const item = sorted[idx]
        if (!item) return ''
        const label = isPity(item) ? ` ${pityText}` : ''
        return `${item.record.item_name}${label}<br/>${t('views.gacha.stats.pullUnit')}: ${item.pulls}`
      }
    },
    grid: { left: 150, right: 60, top: 10, bottom: 30 },
    xAxis: [
      {
        type: 'value',
        name: t('views.gacha.stats.pullUnit'),
        minInterval: 1,
        position: 'bottom'
      },
      {
        type: 'value',
        name: t('views.gacha.stats.pullUnit'),
        minInterval: 1,
        position: 'top',
        axisLabel: { show: true },
        splitLine: { show: false }
      }
    ],
    yAxis: {
      type: 'category',
      data: categories,
      inverse: true,
      axisLabel: {
        interval: 0,
        margin: 10,
        formatter: (_value: string, index: number) => {
          const item = sorted[index]
          if (!item) return ''
          return `{name|${item.record.item_name}} {img_${index}|}`
        },
        rich: {
          ...richStyles,
          name: { fontSize: 12, lineHeight: 28, verticalAlign: 'middle' }
        }
      },
      axisTick: { show: false },
      axisLine: { show: false }
    },
    series: [
      {
        type: 'bar',
        data: values.map((v, i) => ({
          value: v,
          itemStyle: { color: colors[i], borderRadius: [0, 4, 4, 0] }
        })),
        barMaxWidth: 28,
        label: {
          show: true,
          position: 'right',
          formatter: (params: any) => {
            const item = sorted[params.dataIndex]
            return item && isPity(item) ? `${params.value}${pityText}` : `${params.value}`
          },
          fontSize: 11
        }
      }
    ]
  }
})

/** 图表容器高度：根据角色数量动态调整（每行约 44px + 上下留白） */
const barChartHeight = computed(() => {
  const count = props.goldRecordsWithPulls.length
  return `${Math.max(count * 44 + 60, 200)}px`
})

function handleClose() {
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="props.open" @update:open="handleClose">
    <DialogContent class="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>{{ t('views.gacha.stats.detailTitle') }} - {{ props.title }}</DialogTitle>
      </DialogHeader>

      <DialogScrollBody>
        <div class="space-y-6">
          <!-- 每月抽数统计折线图 -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-medium text-sm">{{ t('views.gacha.stats.monthlyPulls') }}</h3>
              <DateRangePicker v-model="dateRange" />
            </div>
            <ECharts :option="lineOption" height="320px" />
          </div>

          <!-- 角色抽数柱状图 -->
          <div v-if="props.goldRecordsWithPulls.length > 0">
            <h3 class="mb-2 font-medium text-sm">{{ t('views.gacha.stats.pullCountChart') }}</h3>
            <div data-slot="scroll-body" class="max-h-[500px] overflow-y-auto">
              <ECharts :option="barOption" :height="barChartHeight" />
            </div>
          </div>
          <div v-else class="py-8 text-center text-muted-foreground text-sm">
            {{ t('views.gacha.stats.noGoldRecords') }}
          </div>
        </div>
      </DialogScrollBody>
    </DialogContent>
  </Dialog>
</template>
