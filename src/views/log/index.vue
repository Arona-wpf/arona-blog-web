<script setup lang="ts">
import { FileText, Pause, Play, RefreshCw, ScrollText } from 'lucide-vue-next'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ResponseCodeEnum } from '@/definitions/enums/request.enums'
import { pr_v1_log_content, pr_v1_log_files, pr_v1_log_types } from '@/fetch/log/index'
import type { LogFileInfo, LogTypeEnum } from '@/fetch/log/types'
import { wsService } from '@/lib/websocket'
import { useUserStore } from '@/stores/user'

const { t } = useI18n()
const userStore = useUserStore()

// 状态
const loading = ref(false)
const logTypes = ref<LogTypeEnum[]>([])
const logFiles = ref<LogFileInfo[]>([])
const currentType = ref<LogTypeEnum>('app')
const currentFile = ref<string>('')
const logLines = ref<string[]>([])
const autoScroll = ref(true)
const totalLines = ref(0)
const hasMore = ref(false)
const loadingHistory = ref(false)

// 直接使用 wsService 的响应式状态
const connected = wsService.connected
const subscribed = wsService.logSubscribed

// DOM引用
const logContainerRef = ref<HTMLDivElement | null>(null)

// 计算属性
const isAdministrator = computed(() => userStore.userInfo?.roles?.includes('administrator'))

const currentLogFileInfo = computed(() => logFiles.value.find((f) => f.filename === currentFile.value))

const currentFileDisplayName = computed(() => {
  if (!currentFile.value) return t('views.log.selectFile')
  return formatFileDisplayName(currentFile.value)
})

const wsStatusText = computed(() => {
  if (!connected.value) return t('views.log.ws.disconnected')
  if (subscribed.value) return t('views.log.ws.subscribed')
  return t('views.log.ws.connected')
})

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

// 格式化文件名显示（去掉 arona-blog-api- 前缀）
function formatFileDisplayName(filename: string): string {
  return filename.replace(/^arona-blog-api-/, '')
}

// 解析日志级别
type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'UNKNOWN'
function getLogLevel(line: string): LogLevel {
  // 日志格式: [timestamp] [LEVEL] [name] [pid] message
  const match = line.match(/\]\s*\[(INFO|WARN|ERROR|DEBUG)\]\s*\[/)
  if (match) {
    return match[1] as LogLevel
  }
  return 'UNKNOWN'
}

// 获取日志级别的样式类
function getLogClass(level: LogLevel): string {
  switch (level) {
    case 'ERROR':
      return 'text-red-500'
    case 'WARN':
      return 'text-yellow-500'
    case 'INFO':
      return 'text-green-500'
    default:
      return ''
  }
}

// 加载日志类型列表
async function loadLogTypes() {
  loading.value = true
  try {
    const res = await pr_v1_log_types()
    if (res.code === ResponseCodeEnum.SUCCESS && res.data) {
      logTypes.value = res.data
      const firstType = res.data.at(0)
      if (firstType) {
        currentType.value = firstType
      }
    }
  } catch {
    toast.error(t('views.log.loadTypesError'))
  } finally {
    loading.value = false
  }
}

// 加载日志文件列表
async function loadLogFiles() {
  loading.value = true
  try {
    const res = await pr_v1_log_files(currentType.value)
    if (res.code === ResponseCodeEnum.SUCCESS && res.data) {
      logFiles.value = res.data
      // 默认选择当前日志文件（非历史）
      const currentLogFile = res.data.find((f) => !f.isHistory)
      if (currentLogFile) {
        currentFile.value = currentLogFile.filename
      } else {
        const firstLogFile = res.data.at(0)
        if (firstLogFile) {
          currentFile.value = firstLogFile.filename
        }
      }
    }
  } catch {
    toast.error(t('views.log.loadFilesError'))
  } finally {
    loading.value = false
  }
}

// 加载历史日志内容
async function loadLogContent(startLine = 0) {
  if (!currentFile.value) return

  loadingHistory.value = true
  try {
    const res = await pr_v1_log_content({
      type: currentType.value,
      filename: currentFile.value,
      startLine,
      limit: 500
    })

    if (res.code === ResponseCodeEnum.SUCCESS && res.data) {
      if (startLine === 0) {
        logLines.value = res.data.lines
      } else {
        logLines.value.push(...res.data.lines)
      }
      totalLines.value = res.data.totalLines
      hasMore.value = res.data.hasMore

      // 自动滚动到底部
      if (autoScroll.value && startLine === 0) {
        scrollToBottom()
      }
    }
  } catch {
    toast.error(t('views.log.loadContentError'))
  } finally {
    loadingHistory.value = false
  }
}

// 滚动到底部
function scrollToBottom() {
  nextTick(() => {
    if (logContainerRef.value) {
      logContainerRef.value.scrollTop = logContainerRef.value.scrollHeight
    }
  })
}

// 开始实时订阅
function startSubscribe() {
  if (!currentFile.value) return

  // 设置回调
  wsService.onLogSubscribed(() => {
    toast.success(t('views.log.ws.subscribeSuccess'))
  })

  wsService.onLogInit((data) => {
    logLines.value = data.lines
    totalLines.value = data.totalLines
    if (autoScroll.value) {
      scrollToBottom()
    }
  })

  wsService.onLogUpdate((data) => {
    logLines.value.push(...data.lines)
    if (autoScroll.value) {
      scrollToBottom()
    }
  })

  wsService.onLogError((message) => {
    toast.error(message)
  })

  // 订阅
  wsService.subscribeLog(currentType.value, currentFile.value)
}

// 停止订阅
function stopSubscribe() {
  wsService.unsubscribeLog(currentType.value)
}

// 切换自动滚动
function toggleAutoScroll() {
  autoScroll.value = !autoScroll.value
}

// 刷新日志
function refreshLog() {
  logLines.value = []
  totalLines.value = 0
  hasMore.value = false
  loadLogContent(0)
}

// 加载更多历史日志
function loadMoreHistory() {
  if (!hasMore.value || loadingHistory.value) return
  loadLogContent(logLines.value.length)
}

// 处理滚动事件
function handleScroll(event: Event) {
  const target = event.target as HTMLDivElement
  // 当滚动到距离底部 100px 时加载更多
  if (target.scrollHeight - target.scrollTop - target.clientHeight < 100) {
    loadMoreHistory()
  }
}

// 监听日志类型变化
watch(
  currentType,
  () => {
    // 停止当前订阅
    if (subscribed.value) {
      stopSubscribe()
    }
    // 加载新的日志文件列表
    logFiles.value = []
    currentFile.value = ''
    logLines.value = []
    loadLogFiles()
  },
  { immediate: true }
)

// 监听日志文件变化
watch(currentFile, (newFile) => {
  if (!newFile) return

  const fileInfo = logFiles.value.find((f) => f.filename === newFile)

  // 如果是历史日志，直接加载内容
  if (fileInfo?.isHistory) {
    if (subscribed.value) {
      stopSubscribe()
    }
    loadLogContent(0)
  } else {
    // 当前日志，先加载内容，然后订阅
    loadLogContent(0)
  }
})

// 生命周期
onMounted(() => {
  // 检查权限
  if (!isAdministrator.value) {
    toast.error(t('views.log.noPermission'))
    return
  }

  loadLogTypes()
})

onUnmounted(() => {
  // 停止订阅
  if (subscribed.value) {
    stopSubscribe()
  }
})
</script>

<template>
  <div class="h-[calc(100vh-8rem)] flex flex-col px-4">
    <!-- 标题区域 -->
    <div class="mb-4 space-y-1">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.log.title') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('views.log.subtitle') }}</p>
    </div>

    <!-- 权限检查 -->
    <div v-if="!isAdministrator" class="flex flex-1 items-center justify-center">
      <p class="text-muted-foreground">{{ t('views.log.noPermission') }}</p>
    </div>

    <!-- 主内容区域 -->
    <div v-else class="min-h-0 flex flex-1 flex-col gap-4 overflow-hidden">
      <!-- 控制栏 -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- 日志类型选择 -->
        <Tabs v-model:model-value="currentType" class="w-auto">
          <TabsList>
            <TabsTrigger v-for="type in logTypes" :key="type" :value="type">
              {{ t(`views.log.types.${type}`) }}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Separator orientation="vertical" class="h-6" />

        <!-- 日志文件选择 -->
        <Select v-model="currentFile">
          <SelectTrigger class="w-[280px]">
            <SelectValue :placeholder="currentFileDisplayName">
              <div class="flex items-center gap-2">
                <FileText class="size-4" />
                <span class="truncate">{{ currentFileDisplayName }}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="file in logFiles" :key="file.filename" :value="file.filename">
              <div class="flex items-center gap-2">
                <span class="truncate">{{ formatFileDisplayName(file.filename) }}</span>
                <span class="text-muted-foreground text-xs"> ({{ formatFileSize(file.size) }}) </span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Separator orientation="vertical" class="h-6" />

        <!-- 操作按钮 -->
        <div class="flex items-center gap-2">
          <!-- 实时订阅按钮 -->
          <Button
            v-if="!subscribed"
            size="sm"
            :disabled="!currentFile || currentLogFileInfo?.isHistory"
            @click="startSubscribe"
          >
            <Play class="size-4" />
            {{ t('views.log.subscribe') }}
          </Button>
          <Button v-else size="sm" variant="destructive" @click="stopSubscribe">
            <Pause class="size-4" />
            {{ t('views.log.unsubscribe') }}
          </Button>

          <!-- 自动滚动按钮 -->
          <Button size="sm" :variant="autoScroll ? 'default' : 'outline'" @click="toggleAutoScroll">
            <ScrollText class="size-4" />
            {{ autoScroll ? t('views.log.autoScrollOn') : t('views.log.autoScrollOff') }}
          </Button>

          <!-- 刷新按钮 -->
          <Button size="sm" variant="outline" @click="refreshLog">
            <RefreshCw class="size-4" />
            {{ t('views.log.refresh') }}
          </Button>
        </div>
      </div>

      <!-- 状态栏 -->
      <div class="flex items-center gap-4 text-xs">
        <div class="flex items-center gap-1">
          <span class="text-muted-foreground">{{ t('views.log.status') }}:</span>
          <span :class="connected ? 'text-green-500' : 'text-red-500'">{{ wsStatusText }}</span>
        </div>
        <Separator orientation="vertical" class="h-4" />
        <div class="flex items-center gap-1">
          <span class="text-muted-foreground">{{ t('views.log.autoScroll') }}:</span>
          <span :class="autoScroll ? 'text-green-500' : 'text-muted-foreground'">
            {{ autoScroll ? t('views.log.autoScrollOn') : t('views.log.autoScrollOff') }}
          </span>
        </div>
        <Separator orientation="vertical" class="h-4" />
        <div class="flex items-center gap-1">
          <span class="text-muted-foreground">{{ t('views.log.lines') }}:</span>
          <span>{{ logLines.length }} / {{ totalLines }}</span>
        </div>
        <Separator orientation="vertical" class="h-4" />
        <div v-if="currentLogFileInfo" class="flex items-center gap-1">
          <span class="text-muted-foreground">{{ t('views.log.size') }}:</span>
          <span>{{ formatFileSize(currentLogFileInfo.size) }}</span>
        </div>
      </div>

      <!-- 日志内容区域 -->
      <div class="border-border min-h-0 flex flex-1 flex-col rounded-lg border overflow-hidden">
        <!-- 加载状态 -->
        <div v-if="loading" class="flex flex-1 items-center justify-center p-4">
          <div class="space-y-3">
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-4 w-3/4" />
            <Skeleton class="h-4 w-1/2" />
          </div>
        </div>

        <!-- 日志内容 -->
        <div v-else ref="logContainerRef" class="flex-1 overflow-y-auto p-4 font-mono text-sm" @scroll="handleScroll">
          <div v-if="logLines.length === 0" class="text-muted-foreground py-8 text-center">
            {{ t('views.log.empty') }}
          </div>
          <div v-else class="space-y-0.5">
            <div
              v-for="(line, index) in logLines"
              :key="index"
              :class="[
                getLogClass(getLogLevel(line)),
                'hover:bg-muted/50 px-2 py-0.5 rounded whitespace-pre-wrap break-all'
              ]"
            >
              {{ line }}
            </div>
          </div>
          <!-- 加载更多指示器 -->
          <div v-if="loadingHistory" class="py-4 text-center">
            <Skeleton class="h-4 w-32 mx-auto" />
          </div>
          <div v-else-if="hasMore && !subscribed" class="py-4 text-center">
            <Button size="sm" variant="ghost" @click="loadMoreHistory">
              {{ t('views.log.loadMore') }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
