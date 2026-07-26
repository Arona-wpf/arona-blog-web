<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { Dialog, DialogContent, DialogHeader, DialogScrollBody, DialogTitle } from '@/components/ui/dialog'
import { ECharts } from '@/components/ui/echarts'
import type { IGachaGoldPulls } from '@/definitions/types/gacha.types'
import type { GachaRecord } from '@/fetch/gacha/types'

const props = defineProps<{
  open: boolean
  title: string
  allRecords: GachaRecord[]
  goldRecordsWithPulls: IGachaGoldPulls[]
  permanentItemIds: string[]
  goldRankType: string
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const { t } = useI18n()

/** 根据 goldRankType 推断三档品质标签 */
const rankLabels = computed(() => {
  if (props.goldRankType === 'S') return { gold: 'S', silver: 'A', bronze: 'B' }
  return { gold: '5★', silver: '4★', bronze: '3★' }
})

const COLORS = {
  gold: '#F6C74B',
  purple: '#9B59B6',
  blue: '#3B82F6'
} as const

/** 饼图数据：各品质数量统计 */
const pieOption = computed<EChartsOption>(() => {
  const records = props.allRecords
  const goldRank = props.goldRankType
  // 确定三档 rank_type 值
  let goldType: string
  let silverType: string
  let bronzeType: string
  if (goldRank === 'S') {
    goldType = 'S'
    silverType = 'A'
    bronzeType = 'B'
  } else {
    goldType = '5'
    silverType = '4'
    bronzeType = '3'
  }

  // 兼容绝区零历史数据中 S 级可能存储为 "4" 的情况
  const goldCount = records.filter((r) => r.rank_type === goldType || (goldRank === 'S' && r.rank_type === '4')).length
  const silverCount = records.filter(
    (r) => r.rank_type === silverType && !(goldRank === 'S' && r.rank_type === '4')
  ).length
  const bronzeCount = records.filter((r) => r.rank_type === bronzeType).length

  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: {
      bottom: 0,
      data: [rankLabels.value.gold, rankLabels.value.silver, rankLabels.value.bronze]
    },
    series: [
      {
        type: 'pie',
        radius: ['35%', '60%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        label: { show: true, formatter: '{b}: {c}' },
        data: [
          { value: goldCount, name: rankLabels.value.gold, itemStyle: { color: COLORS.gold } },
          { value: silverCount, name: rankLabels.value.silver, itemStyle: { color: COLORS.purple } },
          { value: bronzeCount, name: rankLabels.value.bronze, itemStyle: { color: COLORS.blue } }
        ]
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
    xAxis: {
      type: 'value',
      name: t('views.gacha.stats.pullUnit'),
      minInterval: 1
    },
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
          return `{img_${index}|} {name|${item.record.item_name}}`
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
          <!-- 品质分布饼图 -->
          <div>
            <h3 class="mb-2 font-medium text-sm">{{ t('views.gacha.stats.rarityDistribution') }}</h3>
            <ECharts :option="pieOption" height="280px" />
          </div>

          <!-- 角色抽数柱状图 -->
          <div v-if="props.goldRecordsWithPulls.length > 0">
            <h3 class="mb-2 font-medium text-sm">{{ t('views.gacha.stats.pullCountChart') }}</h3>
            <div class="max-h-[500px] overflow-y-auto">
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
