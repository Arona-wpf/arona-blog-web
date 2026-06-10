<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'
import type { EChartsOption } from 'echarts'
import * as echarts from 'echarts'
import { onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'

interface ChartProps {
  option?: EChartsOption
  width?: string | number
  height?: string | number
  loading?: boolean
  theme?: string | object
  renderer?: 'canvas' | 'svg'
}

const props = withDefaults(defineProps<ChartProps>(), {
  width: '100%',
  height: '300px',
  loading: false,
  renderer: 'canvas'
})

const emit = defineEmits<{
  (e: 'chart-click', params: unknown): void
  (e: 'chart-mouseover', params: unknown): void
  (e: 'chart-mouseout', params: unknown): void
  (e: 'chart-ready', chart: echarts.ECharts): void
}>()

const chartRef = ref<HTMLDivElement | null>(null)
const chartInstance = shallowRef<echarts.ECharts | null>(null)

function initChart() {
  if (!chartRef.value) return

  chartInstance.value = echarts.init(chartRef.value, props.theme, {
    renderer: props.renderer
  })

  if (props.option) {
    chartInstance.value.setOption(props.option)
  }

  chartInstance.value.on('click', (params) => {
    emit('chart-click', params)
  })

  chartInstance.value.on('mouseover', (params) => {
    emit('chart-mouseover', params)
  })

  chartInstance.value.on('mouseout', (params) => {
    emit('chart-mouseout', params)
  })

  emit('chart-ready', chartInstance.value)
}

function updateOption() {
  if (chartInstance.value && props.option) {
    chartInstance.value.setOption(props.option, { notMerge: false })
  }
}

function resizeChart() {
  if (chartInstance.value) {
    chartInstance.value.resize()
  }
}

function showLoading() {
  if (chartInstance.value) {
    chartInstance.value.showLoading('default', {
      text: '',
      color: '#409eff',
      maskColor: 'rgba(255, 255, 255, 0.8)'
    })
  }
}

function hideLoading() {
  if (chartInstance.value) {
    chartInstance.value.hideLoading()
  }
}

function disposeChart() {
  if (chartInstance.value) {
    chartInstance.value.dispose()
    chartInstance.value = null
  }
}

watch(() => props.option, updateOption, { deep: true })

watch(
  () => props.loading,
  (val) => {
    if (val) {
      showLoading()
    } else {
      hideLoading()
    }
  }
)

useResizeObserver(chartRef, resizeChart)

onMounted(() => {
  initChart()
  if (props.loading) {
    showLoading()
  }
})

onUnmounted(() => {
  disposeChart()
})

defineExpose({
  getChartInstance: () => chartInstance.value,
  resize: resizeChart,
  setOption: (option: EChartsOption) => {
    if (chartInstance.value) {
      chartInstance.value.setOption(option)
    }
  },
  clear: () => {
    if (chartInstance.value) {
      chartInstance.value.clear()
    }
  }
})
</script>

<template>
  <div
    ref="chartRef"
    :style="{
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height
    }"
  />
</template>
