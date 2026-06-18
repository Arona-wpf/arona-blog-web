<script setup lang="ts">
import { Download, Edit3, Info, RefreshCw, Trash2, Upload } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectEmpty, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GENSHIN_GACHA_POOL_GROUP, SERVER_REGION_I18N_KEY_MAP } from '@/definitions/constants/gacha.constants'
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
const exporting = ref(false)
const updating = ref(false)
const fetchingRecords = ref(false)
const gachaSyncDialogOpen = ref(false)
const gachaSyncMessage = ref('')
const gachaSyncStatus = ref<'processing' | 'completed' | 'failed'>('processing')
const gachaLinkExpired = ref(false)
const permanentPoolConfig = ref<GachaAtlasConfigValue>({ character: [], weapon: [] })
const permanentPoolAtlasMap = ref<Record<string, GachaAtlasItem>>({})

const regionI18nKeys = SERVER_REGION_I18N_KEY_MAP[GameTypeEnum.GENSHIN_IMPACT] || {}

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

// 计算祈愿池统计
function calculateStats(records: GachaRecord[], isLimitedPool = false): IGachaStats {
  const totalPulls = records.length
  const goldRecords = records.filter((r) => r.rank_type === '5')
  const goldCount = goldRecords.length

  // 获取常驻池 item_id 列表（用于判断保底）
  // 配置存储的是 atlas._id，需要通过 atlasMap 获取对应的 item_id
  const permanentAtlasIds = [...permanentPoolConfig.value.character, ...permanentPoolConfig.value.weapon]
  const permanentItemIds = permanentAtlasIds
    .map((atlasId) => permanentPoolAtlasMap.value[atlasId]?.item_id)
    .filter(Boolean)

  // 计算垫了多少抽（距离上次出金后的抽数）
  let pityCount = 0
  if (goldRecords.length > 0) {
    // 找到最近一次出金在records中的位置
    const latestGold = goldRecords[0]
    const lastGoldIndex = latestGold ? records.findIndex((r) => r.gacha_id === latestGold.gacha_id) : -1
    if (lastGoldIndex > 0) {
      pityCount = lastGoldIndex
    }
  } else {
    pityCount = totalPulls
  }

  // 有效抽数 = 总抽数 - 已垫抽数
  const effectivePulls = totalPulls - pityCount

  // 平均每金 = 有效抽数 / 出金数
  const avgPerGold = goldCount > 0 ? (effectivePulls / goldCount).toFixed(1) : '-'

  // 出金率 = 出金数 / 有效抽数 * 100%
  const goldRate = effectivePulls > 0 && goldCount > 0 ? ((goldCount / effectivePulls) * 100).toFixed(2) + '%' : '-'

  // 最近出金
  const lastGold = goldRecords[0] ?? null

  // 保底计算（仅对限定池有效）
  let upGoldCount = 0
  let pityGoldCount = 0
  let upAvgPerGold = '-'
  let upGoldRate = '-'
  let upProbability = '-'
  let pityStatus: 'small' | 'big' | null = null

  if (isLimitedPool && goldCount > 0) {
    // 按时间排序（最早在前）计算保底
    const sortedRecords = [...records].sort((a, b) => compareGachaId(a.gacha_id, b.gacha_id))
    const sortedGoldRecords = sortedRecords.filter((r) => r.rank_type === '5')

    let nextIsGuaranteedUp = false // 下一个是否必定是UP

    for (const gold of sortedGoldRecords) {
      const isPity = permanentItemIds.includes(gold.item_id)

      if (nextIsGuaranteedUp) {
        // 上一个是保底，这个必定是UP
        upGoldCount++
        nextIsGuaranteedUp = false
      } else if (isPity) {
        // 这个是保底（常驻池角色/武器）
        pityGoldCount++
        nextIsGuaranteedUp = true // 下一个必定是UP
      } else {
        // 这个是UP
        upGoldCount++
      }
    }

    // UP平均每金 = 有效抽数 / UP出金数
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

// 计算时间区间
function calculateTimeRange(records: GachaRecord[]): IGachaTimeRange | null {
  if (records.length === 0) return null

  // 按时间排序找到最早和最晚
  const sorted = [...records].sort((a, b) => a.gacha_time - b.gacha_time)
  const earliestRecord = sorted[0]
  const latestRecord = sorted[sorted.length - 1]
  if (!earliestRecord || !latestRecord) return null
  return {
    start: earliestRecord.gacha_time,
    end: latestRecord.gacha_time
  }
}

// 获取指定池类型的所有记录
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

// 计算每个5星花费的抽数
function calculateGoldPulls(records: GachaRecord[]): Array<{ record: GachaRecord; pulls: number }> {
  // 按时间排序（最早在前）
  const sortedRecords = [...records].sort((a, b) => compareGachaId(a.gacha_id, b.gacha_id))
  const goldRecords = sortedRecords.filter((r) => r.rank_type === '5')

  if (goldRecords.length === 0) return []

  const result: Array<{ record: GachaRecord; pulls: number }> = []
  let lastGoldIndex = -1

  for (const gold of goldRecords) {
    const currentGoldIndex = sortedRecords.findIndex((r) => r.gacha_id === gold.gacha_id)
    // 当前金与上一个金之间的抽数（从上一个金的下一抽开始算）
    const pulls = currentGoldIndex - lastGoldIndex
    result.push({ record: gold, pulls })
    lastGoldIndex = currentGoldIndex
  }

  // 反转结果，使最新的金在前（与展示顺序一致）
  return result.reverse()
}

// 角色活动祈愿统计
const characterEventStats = computed<IGachaStats>(() => {
  const records = getPoolRecords(GENSHIN_GACHA_POOL_GROUP.CHARACTER_EVENT)
  return calculateStats(records, true)
})

// 角色活动祈愿时间区间
const characterEventTimeRange = computed<IGachaTimeRange | null>(() => {
  const records = getPoolRecords(GENSHIN_GACHA_POOL_GROUP.CHARACTER_EVENT)
  return calculateTimeRange(records)
})

// 角色活动祈愿5星记录（带抽数）
const characterEventGoldRecordsWithPulls = computed<Array<{ record: GachaRecord; pulls: number }>>(() => {
  const records = getPoolRecords(GENSHIN_GACHA_POOL_GROUP.CHARACTER_EVENT)
  return calculateGoldPulls(records)
})

// 武器活动祈愿统计
const weaponEventStats = computed<IGachaStats>(() => {
  const records = getPoolRecords(GENSHIN_GACHA_POOL_GROUP.WEAPON_EVENT)
  return calculateStats(records, true)
})

// 武器活动祈愿时间区间
const weaponEventTimeRange = computed<IGachaTimeRange | null>(() => {
  const records = getPoolRecords(GENSHIN_GACHA_POOL_GROUP.WEAPON_EVENT)
  return calculateTimeRange(records)
})

// 武器活动祈愿5星记录（带抽数）
const weaponEventGoldRecordsWithPulls = computed<Array<{ record: GachaRecord; pulls: number }>>(() => {
  const records = getPoolRecords(GENSHIN_GACHA_POOL_GROUP.WEAPON_EVENT)
  return calculateGoldPulls(records)
})

// 常驻祈愿统计
const permanentStats = computed<IGachaStats>(() => {
  const records = getPoolRecords(GENSHIN_GACHA_POOL_GROUP.PERMANENT)
  return calculateStats(records)
})

// 常驻祈愿时间区间
const permanentTimeRange = computed<IGachaTimeRange | null>(() => {
  const records = getPoolRecords(GENSHIN_GACHA_POOL_GROUP.PERMANENT)
  return calculateTimeRange(records)
})

// 常驻祈愿5星记录（带抽数）
const permanentGoldRecordsWithPulls = computed<Array<{ record: GachaRecord; pulls: number }>>(() => {
  const records = getPoolRecords(GENSHIN_GACHA_POOL_GROUP.PERMANENT)
  return calculateGoldPulls(records)
})

// 总计统计（合并所有池，常驻池不计入保底统计）
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
  // 按时间排序
  allRecords.sort((a, b) => b.gacha_time - a.gacha_time)
  return calculateStats(allRecords, false)
})

// 总计时间区间
const totalTimeRange = computed<IGachaTimeRange | null>(() => {
  if (!gachaRecords.value) return null
  const allRecords: GachaRecord[] = []
  for (const records of Object.values(gachaRecords.value)) {
    allRecords.push(...records)
  }
  return calculateTimeRange(allRecords)
})

// 总计5星记录（带抽数）- 按各池独立计算后合并，与分池卡片保持一致
const totalGoldRecordsWithPulls = computed<Array<{ record: GachaRecord; pulls: number }>>(() => {
  if (!gachaRecords.value) return []
  const result: Array<{ record: GachaRecord; pulls: number }> = []
  for (const records of Object.values(gachaRecords.value)) {
    result.push(...calculateGoldPulls(records))
  }
  return result.sort((a, b) => compareGachaId(b.record.gacha_id, a.record.gacha_id))
})

// 总价值（每抽160原石）
const totalValue = computed<number>(() => {
  return totalRecords.value * 160
})

// 格式化数字（千分位）
function formatNumber(num: number): string {
  return num.toLocaleString()
}

// 格式化日期
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

// 格式化日期范围显示
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
    // 清空记录数据
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
    const res = await pr_v1_gacha_config_list({ game_type: GameTypeEnum.GENSHIN_IMPACT })
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
      toast.success(t('views.gacha.genshin.fetchRecordsSuccess', { count: totalRecords.value }))
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
    toast.success(t('views.gacha.genshin.syncSuccess', { total: data?.totalRecords || 0 }))
    // 获取最新抽卡记录
    handleFetchRecords()
  } else if (data?.status === 'failed') {
    gachaSyncDialogOpen.value = false
    gachaLinkExpired.value = true
    // 显示失败 toast（后端推送的错误消息）
    if (data?.message) {
      console.log('Gacha sync failed, message from server:', data)
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
      const genshinConfig = res.data.gacha?.find((item) => item.key === 'gacha.genshin.config')
      if (genshinConfig?.value) {
        try {
          const parsed = JSON.parse(genshinConfig.value) as Partial<GachaAtlasConfigValue>
          permanentPoolConfig.value = {
            character: Array.isArray(parsed.character) ? parsed.character : [],
            weapon: Array.isArray(parsed.weapon) ? parsed.weapon : []
          }

          // 获取 atlas 数据建立 _id -> atlas 映射
          const atlasIds = [...permanentPoolConfig.value.character, ...permanentPoolConfig.value.weapon]
          if (atlasIds.length > 0) {
            const atlasRes = await pr_v1_gacha_atlas_items({
              game_type: GameTypeEnum.GENSHIN_IMPACT,
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
  downloadGachaScript(GameTypeEnum.GENSHIN_IMPACT)
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.gacha.genshin.title') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('views.gacha.genshin.description') }}</p>
    </div>

    <div class="grid gap-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1 min-w-0 space-y-2">
          <FormLabel>{{ t('views.gacha.genshin.selectAccount') }}</FormLabel>
          <Select v-model="selectedConfigId">
            <SelectTrigger :loading="loading">
              <SelectValue :placeholder="t('views.gacha.genshin.selectAccountPlaceholder')" />
            </SelectTrigger>
            <SelectContent>
              <SelectEmpty
                v-if="accounts.length === 0"
                :title="t('views.gacha.genshin.noAccounts')"
                :show-button="true"
                :button-text="t('views.gacha.genshin.createAccount')"
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
                {{ t('views.gacha.genshin.addNewAccount') }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="flex-1 min-w-0 space-y-2">
          <FormLabel class="inline-flex items-center gap-1.5 leading-none">
            {{ t('views.gacha.genshin.gachaLink') }}
            <GachaLinkHelpPopover @download-script="handleDownloadGachaScript" />
            <span v-if="gachaLinkExpired" class="text-red-500 text-xs font-medium">{{
              t('views.gacha.genshin.gachaLinkExpired')
            }}</span>
          </FormLabel>
          <Input v-model="gachaLink" :placeholder="t('views.gacha.genshin.gachaLinkPlaceholder')" />
        </div>
      </div>

      <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <div class="flex flex-wrap gap-2 sm:contents">
          <Button :loading="fetchingRecords || updating" :disabled="!selectedConfigId" @click="handleFetchOrUpdate">
            <RefreshCw v-if="!(fetchingRecords || updating)" class="size-4" />
            {{ gachaLink ? t('views.gacha.genshin.update') : t('views.gacha.genshin.fetchRecords') }}
          </Button>
          <Button :disabled="!selectedConfigId" @click="handleEditAccount">
            <Edit3 class="size-4" />
            {{ t('views.gacha.genshin.edit') }}
          </Button>
          <Button variant="destructive" :disabled="!selectedConfigId" @click="handleDeleteAccount">
            <Trash2 class="size-4" />
            {{ t('views.gacha.genshin.delete') }}
          </Button>
        </div>
        <div class="flex flex-wrap gap-2 sm:contents">
          <Button variant="outline" :disabled="!selectedConfigId" @click="handleImport">
            <Upload class="size-4" />
            {{ t('views.gacha.genshin.import') }}
          </Button>
          <Button variant="outline" :loading="exporting" :disabled="!selectedConfigId" @click="handleExport">
            <Download class="size-4" />
            {{ t('views.gacha.genshin.export') }}
          </Button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div v-if="gachaRecords && totalRecords > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <GachaStatsCard
        :title="t('views.gacha.genshin.characterEvent')"
        :stats="characterEventStats"
        :time-range="characterEventTimeRange"
        :tag="t('views.gacha.genshin.characterEventTag')"
        :gold-records-with-pulls="characterEventGoldRecordsWithPulls"
        :is-limited-pool="true"
      />
      <GachaStatsCard
        :title="t('views.gacha.genshin.weaponEvent')"
        :stats="weaponEventStats"
        :time-range="weaponEventTimeRange"
        :tag="t('views.gacha.genshin.weaponEventTag')"
        :gold-records-with-pulls="weaponEventGoldRecordsWithPulls"
        :is-limited-pool="true"
      />
      <GachaStatsCard
        :title="t('views.gacha.genshin.permanent')"
        :stats="permanentStats"
        :time-range="permanentTimeRange"
        :tag="t('views.gacha.genshin.permanentTag')"
        :gold-records-with-pulls="permanentGoldRecordsWithPulls"
      />
      <GachaStatsCard
        :title="t('views.gacha.genshin.total')"
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
      empty-not-selected-key="views.gacha.genshin.empty.notSelected"
      empty-no-records-key="views.gacha.genshin.empty.noRecords"
    />

    <!-- 说明文字 -->
    <div v-if="gachaRecords && totalRecords > 0" class="text-muted-foreground text-sm space-y-2">
      <p class="flex items-start gap-2">
        <Info class="size-4 mt-0.5 shrink-0" />
        <span>
          {{ t('views.gacha.genshin.summaryTotalPrefix') }}
          <span class="text-primary font-medium">{{ formatNumber(totalRecords) }}</span>
          {{ t('views.gacha.genshin.summaryTotalMiddle') }}
          <span class="text-yellow-500 font-medium">{{ formatNumber(totalValue) }}</span>
          {{ t('views.gacha.genshin.summaryTotalSuffix') }}
        </span>
      </p>
      <p class="flex items-start gap-2">
        <Info class="size-4 mt-0.5 shrink-0" />
        <span>
          {{ t('views.gacha.genshin.summaryTimeRangePrefix') }}
          <span class="text-green-500 font-medium">{{ formattedTimeRangeDisplay }}</span>
        </span>
      </p>
      <p class="flex items-start gap-2">
        <Info class="size-4 mt-0.5 shrink-0" />
        <span>
          {{ t('views.gacha.genshin.summaryNoticePrefix') }}
          <span class="text-red-500 font-medium">{{ t('views.gacha.genshin.summaryNotice6Months') }}</span>
          {{ t('views.gacha.genshin.summaryNoticeMiddle1') }}
          <span class="text-red-500 font-medium">{{ t('views.gacha.genshin.summaryNotice1Hour') }}</span>
          {{ t('views.gacha.genshin.summaryNoticeMiddle2') }}
        </span>
      </p>
    </div>

    <CreateConfigDialog
      v-model:open="createDialogOpen"
      :game-type="GameTypeEnum.GENSHIN_IMPACT"
      @success="handleDialogSuccess"
    />

    <CreateConfigDialog
      v-model:open="editDialogOpen"
      :game-type="GameTypeEnum.GENSHIN_IMPACT"
      :edit-mode="true"
      :edit-data="configList.find((c) => c._id === selectedConfigId)"
      @success="handleEditSuccess"
    />

    <GachaImportDialog
      v-model:open="importDialogOpen"
      :game-type="GameTypeEnum.GENSHIN_IMPACT"
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
