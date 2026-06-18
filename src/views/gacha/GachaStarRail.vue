<script setup lang="ts">
import { Download, Edit3, Info, RefreshCw, Trash2, Upload } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectEmpty, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  GACHA_COST_PER_PULL,
  SERVER_REGION_I18N_KEY_MAP,
  STARRAIL_GACHA_POOL_GROUP
} from '@/definitions/constants/gacha.constants'
import { GameTypeEnum } from '@/definitions/enums/gacha.enum'
import { ResponseCodeEnum } from '@/definitions/enums/request.enums'
import {
  compareGachaId,
  type GachaAtlasConfigValue,
  type IGachaStats,
  type IGachaTimeRange
} from '@/definitions/types/gacha.types'
import type { GachaSyncLogData } from '@/definitions/types/websocket.types'
import {
  pr_v1_gacha_atlas_items,
  pr_v1_gacha_config_list,
  pr_v1_gacha_record_list,
  pr_v1_gacha_sync
} from '@/fetch/gacha'
import type { GachaAtlasItem, GachaConfig, GachaRecord, GetGachaRecordListResData } from '@/fetch/gacha/types'
import { pr_v1_config_get } from '@/fetch/system'
import { downloadGachaScript } from '@/lib/gacha-script'
import { wsService } from '@/lib/websocket'

import GachaEmptyState from './components/GachaEmptyState.vue'
import GachaFetchingState from './components/GachaFetchingState.vue'
import GachaLinkHelpPopover from './components/GachaLinkHelpPopover.vue'
import GachaStatsCard from './components/GachaStatsCard.vue'
import CreateConfigDialog from './dialog/CreateConfigDialog.vue'
import GachaDeleteDialog from './dialog/GachaDeleteDialog.vue'
import GachaExportDialog from './dialog/GachaExportDialog.vue'
import GachaImportDialog from './dialog/GachaImportDialog.vue'
import GachaSyncProgressDialog from './dialog/GachaSyncProgressDialog.vue'

const { t } = useI18n()

const selectedConfigId = ref<string>('')
const gachaLink = ref<string>('')
const configList = ref<GachaConfig[]>([])
const gachaRecords = ref<GetGachaRecordListResData | null>(null)
const loading = ref(false)
const createDialogOpen = ref(false)
const editDialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const importDialogOpen = ref(false)
const exportDialogOpen = ref(false)
const updating = ref(false)
const fetchingRecords = ref(false)
const exporting = ref(false)
const gachaSyncDialogOpen = ref(false)
const gachaSyncMessage = ref('')
const gachaSyncStatus = ref<'processing' | 'completed' | 'failed'>('processing')
const gachaLinkExpired = ref(false)
const permanentPoolConfig = ref<GachaAtlasConfigValue>({ character: [], weapon: [] })
const permanentPoolAtlasMap = ref<Record<string, GachaAtlasItem>>({})

const regionI18nKeys = SERVER_REGION_I18N_KEY_MAP[GameTypeEnum.HONKAI_STAR_RAIL] || {}

const accounts = computed(() =>
  configList.value.map((config) => ({
    id: config._id,
    name: `${config.game_nickname} (${t(regionI18nKeys[config.region] || config.region)}-${config.game_uid})`,
    gacha_url: config.gacha_url || ''
  }))
)

const selectedAccount = computed(() => accounts.value.find((a) => a.id === selectedConfigId.value))

const totalRecords = computed(() => {
  if (!gachaRecords.value) return 0
  return Object.values(gachaRecords.value).reduce((sum, records) => sum + records.length, 0)
})

// 计算跃迁池统计
function calculateStats(records: GachaRecord[], isLimitedPool = false): IGachaStats {
  const totalPulls = records.length
  const goldRecords = records.filter((r) => r.rank_type === '5')
  const goldCount = goldRecords.length

  // 获取常驻池 item_id 列表（用于判断保底）
  const permanentAtlasIds = [...permanentPoolConfig.value.character, ...permanentPoolConfig.value.weapon]
  const permanentItemIds = permanentAtlasIds
    .map((atlasId) => permanentPoolAtlasMap.value[atlasId]?.item_id)
    .filter(Boolean)

  let pityCount = 0
  if (goldRecords.length > 0) {
    const latestGold = goldRecords[0]
    const lastGoldIndex = latestGold ? records.findIndex((r) => r.gacha_id === latestGold.gacha_id) : -1
    if (lastGoldIndex > 0) {
      pityCount = lastGoldIndex
    }
  } else {
    pityCount = totalPulls
  }

  const effectivePulls = totalPulls - pityCount
  const avgPerGold = goldCount > 0 ? (effectivePulls / goldCount).toFixed(1) : '-'
  const goldRate = effectivePulls > 0 && goldCount > 0 ? ((goldCount / effectivePulls) * 100).toFixed(2) + '%' : '-'
  const lastGold = goldRecords[0] ?? null

  // 保底计算（仅对限定池有效）
  let upGoldCount = 0
  let pityGoldCount = 0
  let upAvgPerGold = '-'
  let upGoldRate = '-'
  let upProbability = '-'
  let pityStatus: 'small' | 'big' | null = null

  if (isLimitedPool && goldCount > 0) {
    const sortedRecords = [...records].sort((a, b) => compareGachaId(a.gacha_id, b.gacha_id))
    const sortedGoldRecords = sortedRecords.filter((r) => r.rank_type === '5')

    let nextIsGuaranteedUp = false

    for (const gold of sortedGoldRecords) {
      const isPity = permanentItemIds.includes(gold.item_id)

      if (nextIsGuaranteedUp) {
        upGoldCount++
        nextIsGuaranteedUp = false
      } else if (isPity) {
        pityGoldCount++
        nextIsGuaranteedUp = true
      } else {
        upGoldCount++
      }
    }

    if (upGoldCount > 0) {
      upAvgPerGold = (effectivePulls / upGoldCount).toFixed(1)
      upGoldRate = ((upGoldCount / effectivePulls) * 100).toFixed(2) + '%'
    }

    // UP概率 = UP金数 / 总金数
    upProbability = ((upGoldCount / goldCount) * 100).toFixed(2) + '%'

    // 判断当前保底状态：根据最近一次出金是否为常驻池角色/武器
    if (lastGold) {
      const isLastGoldPity = permanentItemIds.includes(lastGold.item_id)
      pityStatus = isLastGoldPity ? 'big' : 'small'
    }
  }

  return {
    totalPulls,
    goldCount,
    upGoldCount,
    pityGoldCount,
    pityCount,
    pityStatus,
    avgPerGold,
    upAvgPerGold,
    goldRate,
    upGoldRate,
    upProbability,
    lastGold
  }
}

function calculateTimeRange(records: GachaRecord[]): IGachaTimeRange | null {
  if (records.length === 0) return null
  const sorted = [...records].sort((a, b) => a.gacha_time - b.gacha_time)
  const earliestRecord = sorted[0]
  const latestRecord = sorted[sorted.length - 1]
  if (!earliestRecord || !latestRecord) return null
  return {
    start: earliestRecord.gacha_time,
    end: latestRecord.gacha_time
  }
}

function getPoolRecords(poolTypes: string[]): GachaRecord[] {
  if (!gachaRecords.value) return []
  const allRecords: GachaRecord[] = []
  for (const poolType of poolTypes) {
    if (gachaRecords.value[poolType]) {
      allRecords.push(...gachaRecords.value[poolType])
    }
  }
  return allRecords
}

function calculateGoldPulls(records: GachaRecord[]): Array<{ record: GachaRecord; pulls: number }> {
  const sortedRecords = [...records].sort((a, b) => compareGachaId(a.gacha_id, b.gacha_id))
  const goldRecords = sortedRecords.filter((r) => r.rank_type === '5')

  if (goldRecords.length === 0) return []

  const result: Array<{ record: GachaRecord; pulls: number }> = []
  let lastGoldIndex = -1

  for (const gold of goldRecords) {
    const currentGoldIndex = sortedRecords.findIndex((r) => r.gacha_id === gold.gacha_id)
    const pulls = currentGoldIndex - lastGoldIndex
    result.push({ record: gold, pulls })
    lastGoldIndex = currentGoldIndex
  }

  return result.reverse()
}

// 角色活动跃迁统计
const characterEventStats = computed<IGachaStats>(() => {
  const records = getPoolRecords(STARRAIL_GACHA_POOL_GROUP.CHARACTER_EVENT)
  return calculateStats(records, true)
})

const characterEventTimeRange = computed<IGachaTimeRange | null>(() => {
  const records = getPoolRecords(STARRAIL_GACHA_POOL_GROUP.CHARACTER_EVENT)
  return calculateTimeRange(records)
})

const characterEventGoldRecordsWithPulls = computed<Array<{ record: GachaRecord; pulls: number }>>(() => {
  const records = getPoolRecords(STARRAIL_GACHA_POOL_GROUP.CHARACTER_EVENT)
  return calculateGoldPulls(records)
})

// 光锥活动跃迁统计
const lightConeEventStats = computed<IGachaStats>(() => {
  const records = getPoolRecords(STARRAIL_GACHA_POOL_GROUP.LIGHT_CONE_EVENT)
  return calculateStats(records, true)
})

const lightConeEventTimeRange = computed<IGachaTimeRange | null>(() => {
  const records = getPoolRecords(STARRAIL_GACHA_POOL_GROUP.LIGHT_CONE_EVENT)
  return calculateTimeRange(records)
})

const lightConeEventGoldRecordsWithPulls = computed<Array<{ record: GachaRecord; pulls: number }>>(() => {
  const records = getPoolRecords(STARRAIL_GACHA_POOL_GROUP.LIGHT_CONE_EVENT)
  return calculateGoldPulls(records)
})

// 常驻跃迁统计
const permanentStats = computed<IGachaStats>(() => {
  const records = getPoolRecords(STARRAIL_GACHA_POOL_GROUP.PERMANENT)
  return calculateStats(records)
})

const permanentTimeRange = computed<IGachaTimeRange | null>(() => {
  const records = getPoolRecords(STARRAIL_GACHA_POOL_GROUP.PERMANENT)
  return calculateTimeRange(records)
})

const permanentGoldRecordsWithPulls = computed<Array<{ record: GachaRecord; pulls: number }>>(() => {
  const records = getPoolRecords(STARRAIL_GACHA_POOL_GROUP.PERMANENT)
  return calculateGoldPulls(records)
})

// 总计统计
const totalStats = computed<IGachaStats>(() => {
  if (!gachaRecords.value) {
    return {
      totalPulls: 0,
      goldCount: 0,
      upGoldCount: 0,
      pityGoldCount: 0,
      pityCount: 0,
      pityStatus: null,
      avgPerGold: '-',
      upAvgPerGold: '-',
      goldRate: '-',
      upGoldRate: '-',
      upProbability: '-',
      lastGold: null
    }
  }
  const allRecords: GachaRecord[] = []
  for (const records of Object.values(gachaRecords.value)) {
    allRecords.push(...records)
  }
  allRecords.sort((a, b) => b.gacha_time - a.gacha_time)
  return calculateStats(allRecords, false)
})

const totalTimeRange = computed<IGachaTimeRange | null>(() => {
  if (!gachaRecords.value) return null
  const allRecords: GachaRecord[] = []
  for (const records of Object.values(gachaRecords.value)) {
    allRecords.push(...records)
  }
  return calculateTimeRange(allRecords)
})

const totalGoldRecordsWithPulls = computed<Array<{ record: GachaRecord; pulls: number }>>(() => {
  if (!gachaRecords.value) return []
  const result: Array<{ record: GachaRecord; pulls: number }> = []
  for (const records of Object.values(gachaRecords.value)) {
    result.push(...calculateGoldPulls(records))
  }
  return result.sort((a, b) => compareGachaId(b.record.gacha_id, a.record.gacha_id))
})

const costPerPull = GACHA_COST_PER_PULL[GameTypeEnum.HONKAI_STAR_RAIL]
const totalValue = computed<number>(() => {
  return totalRecords.value * costPerPull
})

function formatNumber(num: number): string {
  return num.toLocaleString()
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit'
  })
}

const formattedTimeRangeDisplay = computed<string>(() => {
  if (!totalTimeRange.value) return ''
  return `${formatDate(totalTimeRange.value.start)} - ${formatDate(totalTimeRange.value.end)}`
})

watch(selectedConfigId, (newId) => {
  if (newId) {
    const account = accounts.value.find((a) => a.id === newId)
    if (account && account.gacha_url) {
      gachaLink.value = account.gacha_url
    } else {
      gachaLink.value = ''
    }
    gachaRecords.value = null
    gachaLinkExpired.value = false
  } else {
    gachaLink.value = ''
    gachaRecords.value = null
    gachaLinkExpired.value = false
  }
})

async function fetchConfigList() {
  loading.value = true
  try {
    const res = await pr_v1_gacha_config_list({ game_type: GameTypeEnum.HONKAI_STAR_RAIL })
    if (res.code === ResponseCodeEnum.SUCCESS) {
      configList.value = res.data || []
    }
  } finally {
    loading.value = false
  }
}

async function handleFetchRecords() {
  if (!selectedConfigId.value || fetchingRecords.value) return

  fetchingRecords.value = true
  try {
    const res = await pr_v1_gacha_record_list({ gacha_config_id: selectedConfigId.value })
    if (res.code === ResponseCodeEnum.SUCCESS) {
      gachaRecords.value = res.data || {}
      toast.success(t('views.gacha.starrail.fetchRecordsSuccess', { count: totalRecords.value }))
    }
  } finally {
    fetchingRecords.value = false
  }
}

const handleGachaSyncLog = (data: GachaSyncLogData) => {
  gachaSyncMessage.value = data?.message || t('global.gachaSync.defaultProgress')
  gachaSyncStatus.value = data?.status || 'processing'
  if (data?.status === 'completed') {
    gachaSyncDialogOpen.value = false
    gachaLinkExpired.value = false
    // 显示同步完成 toast
    toast.success(t('views.gacha.starrail.syncSuccess', { total: data?.totalRecords || 0 }))
    // 获取最新抽卡记录
    handleFetchRecords()
  } else if (data?.status === 'failed') {
    gachaSyncDialogOpen.value = false
    gachaLinkExpired.value = true
    // 显示失败 toast（后端推送的错误消息）
    if (data?.message) {
      toast.error(data.message)
    }
    // 无论成功失败，都获取最新抽卡记录
    handleFetchRecords()
  } else {
    gachaSyncDialogOpen.value = true
  }
}

/** 获取常驻池配置和 atlas 数据 */
async function fetchPermanentPoolConfig() {
  try {
    const res = await pr_v1_config_get()
    if (res.code === ResponseCodeEnum.SUCCESS && res.data) {
      const starrailConfig = res.data.gacha?.find((item) => item.key === 'gacha.starrail.config')
      if (starrailConfig?.value) {
        try {
          const parsed = JSON.parse(starrailConfig.value) as Partial<GachaAtlasConfigValue>
          permanentPoolConfig.value = {
            character: Array.isArray(parsed.character) ? parsed.character : [],
            weapon: Array.isArray(parsed.weapon) ? parsed.weapon : []
          }

          // 获取 atlas 数据建立 _id -> atlas 映射
          const atlasIds = [...permanentPoolConfig.value.character, ...permanentPoolConfig.value.weapon]
          if (atlasIds.length > 0) {
            const atlasRes = await pr_v1_gacha_atlas_items({
              game_type: GameTypeEnum.HONKAI_STAR_RAIL,
              ids: atlasIds
            })
            if (atlasRes.code === ResponseCodeEnum.SUCCESS && atlasRes.data) {
              const atlasMap: Record<string, GachaAtlasItem> = {}
              for (const item of atlasRes.data) {
                if (item._id) {
                  atlasMap[item._id] = item
                }
              }
              permanentPoolAtlasMap.value = atlasMap
            }
          }
        } catch {
          permanentPoolConfig.value = { character: [], weapon: [] }
          permanentPoolAtlasMap.value = {}
        }
      }
    }
  } catch {
    // 获取配置失败不影响主流程
  }
}

async function initializePage() {
  await Promise.all([fetchConfigList(), fetchPermanentPoolConfig()])
  const firstConfig = configList.value[0]
  if (firstConfig) {
    selectedConfigId.value = firstConfig._id
    await handleFetchRecords()
  }
}

onMounted(() => {
  initializePage()
  wsService.onGachaSyncLog(handleGachaSyncLog)
})

onUnmounted(() => {
  wsService.onGachaSyncLog(() => undefined)
})

async function handleFetchOrUpdate() {
  if (!selectedConfigId.value) return
  if (gachaLink.value) {
    await handleUpdate()
  } else {
    await handleFetchRecords()
  }
}

async function handleUpdate() {
  if (!selectedConfigId.value || !gachaLink.value || updating.value) return

  // 清除过期提示
  gachaLinkExpired.value = false
  updating.value = true
  try {
    await pr_v1_gacha_sync({
      gacha_config_id: selectedConfigId.value,
      gacha_url: gachaLink.value
    })
    // 同步结果由 ws 推送，在 handleGachaSyncLog 中处理
  } finally {
    updating.value = false
  }
}

function handleImport() {
  if (!selectedConfigId.value) return
  importDialogOpen.value = true
}

function handleExport() {
  if (!selectedConfigId.value) return
  exportDialogOpen.value = true
}

function handleImportSuccess() {
  fetchConfigList()
}

function handleCreateAccount(resetValue = false) {
  if (resetValue) {
    selectedConfigId.value = ''
  }
  createDialogOpen.value = true
}

function handleEditAccount() {
  if (!selectedAccount.value) return
  editDialogOpen.value = true
}

function handleDeleteAccount() {
  if (!selectedAccount.value) return
  deleteDialogOpen.value = true
}

function handleDeleteSuccess() {
  selectedConfigId.value = ''
  fetchConfigList()
}

function handleEditSuccess() {
  fetchConfigList()
  // 编辑成功后，更新当前链接显示
  const updatedConfig = configList.value.find((c) => c._id === selectedConfigId.value)
  if (updatedConfig) {
    gachaLink.value = updatedConfig.gacha_url || ''
    gachaLinkExpired.value = false
  }
}

function handleDialogSuccess() {
  fetchConfigList()
}

function handleDownloadGachaScript() {
  downloadGachaScript(GameTypeEnum.HONKAI_STAR_RAIL)
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.gacha.starrail.title') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('views.gacha.starrail.description') }}</p>
    </div>

    <div class="grid gap-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1 min-w-0 space-y-2">
          <FormLabel>{{ t('views.gacha.starrail.selectAccount') }}</FormLabel>
          <Select v-model="selectedConfigId">
            <SelectTrigger :loading="loading">
              <SelectValue :placeholder="t('views.gacha.starrail.selectAccountPlaceholder')" />
            </SelectTrigger>
            <SelectContent>
              <SelectEmpty
                v-if="accounts.length === 0"
                :title="t('views.gacha.starrail.noAccounts')"
                :show-button="true"
                :button-text="t('views.gacha.starrail.createAccount')"
                @custom-button="handleCreateAccount"
              />
              <SelectItem v-for="account in accounts" :key="account.id" :value="account.id">
                {{ account.name }}
              </SelectItem>
              <SelectItem
                v-if="accounts.length > 0 && accounts.length < 10"
                value="add_new_game_account"
                @click="handleCreateAccount(true)"
              >
                {{ t('views.gacha.starrail.addNewAccount') }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="flex-1 min-w-0 space-y-2">
          <FormLabel class="inline-flex items-center gap-1.5 leading-none">
            {{ t('views.gacha.starrail.gachaLink') }}
            <GachaLinkHelpPopover @download-script="handleDownloadGachaScript" />
            <span v-if="gachaLinkExpired" class="text-red-500 text-xs font-medium">{{
              t('views.gacha.starrail.gachaLinkExpired')
            }}</span>
          </FormLabel>
          <Input v-model="gachaLink" :placeholder="t('views.gacha.starrail.gachaLinkPlaceholder')" />
        </div>
      </div>

      <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <div class="flex flex-wrap gap-2 sm:contents">
          <Button :loading="fetchingRecords || updating" :disabled="!selectedConfigId" @click="handleFetchOrUpdate">
            <RefreshCw v-if="!(fetchingRecords || updating)" class="size-4" />
            {{ gachaLink ? t('views.gacha.starrail.update') : t('views.gacha.starrail.fetchRecords') }}
          </Button>
          <Button :disabled="!selectedConfigId" @click="handleEditAccount">
            <Edit3 class="size-4" />
            {{ t('views.gacha.starrail.edit') }}
          </Button>
          <Button variant="destructive" :disabled="!selectedConfigId" @click="handleDeleteAccount">
            <Trash2 class="size-4" />
            {{ t('views.gacha.starrail.delete') }}
          </Button>
        </div>
        <div class="flex flex-wrap gap-2 sm:contents">
          <Button variant="outline" :disabled="!selectedConfigId" @click="handleImport">
            <Upload class="size-4" />
            {{ t('views.gacha.starrail.import') }}
          </Button>
          <Button variant="outline" :loading="exporting" :disabled="!selectedConfigId" @click="handleExport">
            <Download class="size-4" />
            {{ t('views.gacha.starrail.export') }}
          </Button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div v-if="gachaRecords && totalRecords > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <GachaStatsCard
        :title="t('views.gacha.starrail.characterEvent')"
        :stats="characterEventStats"
        :time-range="characterEventTimeRange"
        :tag="t('views.gacha.starrail.characterEventTag')"
        :gold-records-with-pulls="characterEventGoldRecordsWithPulls"
        :is-limited-pool="true"
      />
      <GachaStatsCard
        :title="t('views.gacha.starrail.lightConeEvent')"
        :stats="lightConeEventStats"
        :time-range="lightConeEventTimeRange"
        :tag="t('views.gacha.starrail.lightConeEventTag')"
        :gold-records-with-pulls="lightConeEventGoldRecordsWithPulls"
        :is-limited-pool="true"
      />
      <GachaStatsCard
        :title="t('views.gacha.starrail.permanent')"
        :stats="permanentStats"
        :time-range="permanentTimeRange"
        :tag="t('views.gacha.starrail.permanentTag')"
        :gold-records-with-pulls="permanentGoldRecordsWithPulls"
      />
      <GachaStatsCard
        :title="t('views.gacha.starrail.total')"
        :stats="totalStats"
        :time-range="totalTimeRange"
        :gold-records-with-pulls="totalGoldRecordsWithPulls"
      />
    </div>

    <!-- 加载中 -->
    <GachaFetchingState v-else-if="fetchingRecords" message-key="views.gacha.common.fetchingRecords" />

    <!-- 空状态 -->
    <GachaEmptyState
      v-else
      :has-selected-account="!!selectedConfigId"
      empty-not-selected-key="views.gacha.starrail.empty.notSelected"
      empty-no-records-key="views.gacha.starrail.empty.noRecords"
    />

    <!-- 说明文字 -->
    <div v-if="gachaRecords && totalRecords > 0" class="text-muted-foreground text-sm space-y-2">
      <p class="flex items-start gap-2">
        <Info class="size-4 mt-0.5 shrink-0" />
        <span>
          {{ t('views.gacha.starrail.summaryTotalPrefix') }}
          <span class="text-primary font-medium">{{ formatNumber(totalRecords) }}</span>
          {{ t('views.gacha.starrail.summaryTotalMiddle') }}
          <span class="text-yellow-500 font-medium">{{ formatNumber(totalValue) }}</span>
          {{ t('views.gacha.starrail.summaryTotalSuffix') }}
        </span>
      </p>
      <p class="flex items-start gap-2">
        <Info class="size-4 mt-0.5 shrink-0" />
        <span>
          {{ t('views.gacha.starrail.summaryTimeRangePrefix') }}
          <span class="text-green-500 font-medium">{{ formattedTimeRangeDisplay }}</span>
        </span>
      </p>
      <p class="flex items-start gap-2">
        <Info class="size-4 mt-0.5 shrink-0" />
        <span>
          {{ t('views.gacha.starrail.summaryNoticePrefix') }}
          <span class="text-red-500 font-medium">{{ t('views.gacha.starrail.summaryNotice6Months') }}</span>
          {{ t('views.gacha.starrail.summaryNoticeMiddle1') }}
          <span class="text-red-500 font-medium">{{ t('views.gacha.starrail.summaryNotice1Hour') }}</span>
          {{ t('views.gacha.starrail.summaryNoticeMiddle2') }}
        </span>
      </p>
    </div>

    <CreateConfigDialog
      v-model:open="createDialogOpen"
      :game-type="GameTypeEnum.HONKAI_STAR_RAIL"
      @success="handleDialogSuccess"
    />

    <CreateConfigDialog
      v-model:open="editDialogOpen"
      :game-type="GameTypeEnum.HONKAI_STAR_RAIL"
      :edit-mode="true"
      :edit-data="configList.find((c) => c._id === selectedConfigId)"
      @success="handleEditSuccess"
    />

    <GachaImportDialog
      v-model:open="importDialogOpen"
      :game-type="GameTypeEnum.HONKAI_STAR_RAIL"
      :gacha-config-id="selectedConfigId"
      @success="handleImportSuccess"
    />

    <GachaExportDialog
      v-model:open="exportDialogOpen"
      :config-id="selectedConfigId"
      :default-file-name="selectedAccount?.name"
      @exporting="exporting = $event"
    />

    <GachaDeleteDialog
      v-model:open="deleteDialogOpen"
      :account-id="selectedAccount?.id || ''"
      :account-name="selectedAccount?.name || ''"
      @success="handleDeleteSuccess"
    />

    <GachaSyncProgressDialog v-model:open="gachaSyncDialogOpen" :message="gachaSyncMessage" :status="gachaSyncStatus" />
  </div>
</template>
