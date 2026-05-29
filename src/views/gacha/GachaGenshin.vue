<script setup lang="ts">
import { Download, Info, Trash2, Upload } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectEmpty, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GENSHIN_GACHA_POOL_GROUP, SERVER_REGION_I18N_KEY_MAP } from '@/definitions/constants/gacha.constants'
import { GameTypeEnum } from '@/definitions/enums/gacha.enum'
import { ResponseCodeEnum } from '@/definitions/enums/request.enums'
import type { IGachaStats, IGachaTimeRange } from '@/definitions/types/gacha.types'
import { pr_v1_gacha_config_list, pr_v1_gacha_record_list } from '@/fetch/gacha'
import type { GachaConfig, GachaRecord, GetGachaRecordListResData } from '@/fetch/gacha/types'

import GachaEmptyState from './components/GachaEmptyState.vue'
import GachaStatsCard from './components/GachaStatsCard.vue'
import CreateConfigDialog from './dialog/CreateConfigDialog.vue'
import GachaDeleteDialog from './dialog/GachaDeleteDialog.vue'
import GachaExportDialog from './dialog/GachaExportDialog.vue'
import GachaImportDialog from './dialog/GachaImportDialog.vue'

const { t } = useI18n()

const selectedConfigId = ref<string>('')
const gachaLink = ref<string>('')
const configList = ref<GachaConfig[]>([])
const gachaRecords = ref<GetGachaRecordListResData | null>(null)
const loading = ref(false)
const createDialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const importDialogOpen = ref(false)
const updating = ref(false)
const fetchingRecords = ref(false)

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
function calculateStats(records: GachaRecord[]): IGachaStats {
  const totalPulls = records.length
  const goldRecords = records.filter((r) => r.rank_type === '5')
  const goldCount = goldRecords.length

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

  return {
    totalPulls,
    goldCount,
    pityCount,
    avgPerGold,
    goldRate,
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
  const sortedRecords = [...records].sort((a, b) => a.gacha_time - b.gacha_time)
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
  return calculateStats(records)
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
  return calculateStats(records)
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

// 总计统计
const totalStats = computed<IGachaStats>(() => {
  if (!gachaRecords.value) {
    return {
      totalPulls: 0,
      goldCount: 0,
      pityCount: 0,
      avgPerGold: '-',
      goldRate: '-',
      lastGold: null
    }
  }
  const allRecords: GachaRecord[] = []
  for (const records of Object.values(gachaRecords.value)) {
    allRecords.push(...records)
  }
  // 按时间排序
  allRecords.sort((a, b) => b.gacha_time - a.gacha_time)
  return calculateStats(allRecords)
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

// 总计5星记录（带抽数）
const totalGoldRecordsWithPulls = computed<Array<{ record: GachaRecord; pulls: number }>>(() => {
  if (!gachaRecords.value) return []
  const allRecords: GachaRecord[] = []
  for (const records of Object.values(gachaRecords.value)) {
    allRecords.push(...records)
  }
  return calculateGoldPulls(allRecords)
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
  } else {
    gachaLink.value = ''
    gachaRecords.value = null
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

onMounted(() => {
  fetchConfigList()
})

function handleUpdate() {}

const exportDialogOpen = ref(false)

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

function handleDeleteAccount() {
  if (!selectedAccount.value) return
  deleteDialogOpen.value = true
}

function handleDeleteSuccess() {
  selectedConfigId.value = ''
  fetchConfigList()
}

function handleDialogSuccess() {
  fetchConfigList()
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
          <FormLabel>{{ t('views.gacha.genshin.gachaLink') }}</FormLabel>
          <Input v-model="gachaLink" :placeholder="t('views.gacha.genshin.gachaLinkPlaceholder')" />
        </div>
      </div>

      <div class="flex flex-wrap gap-2">
        <Button :loading="fetchingRecords" :disabled="!selectedConfigId" @click="handleFetchRecords">
          {{ t('views.gacha.genshin.fetchRecords') }}
        </Button>
        <Button :loading="updating" :disabled="!selectedConfigId || !gachaLink" @click="handleUpdate">
          {{ t('views.gacha.genshin.update') }}
        </Button>
        <Button variant="outline" :disabled="!selectedConfigId" @click="handleImport">
          <Upload class="size-4" />
          {{ t('views.gacha.genshin.import') }}
        </Button>
        <Button variant="outline" :disabled="!selectedConfigId" @click="handleExport">
          <Download class="size-4" />
          {{ t('views.gacha.genshin.export') }}
        </Button>
        <Button variant="destructive" :disabled="!selectedConfigId" @click="handleDeleteAccount">
          <Trash2 class="size-4" />
          {{ t('views.gacha.genshin.delete') }}
        </Button>
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
      />
      <GachaStatsCard
        :title="t('views.gacha.genshin.weaponEvent')"
        :stats="weaponEventStats"
        :time-range="weaponEventTimeRange"
        :tag="t('views.gacha.genshin.weaponEventTag')"
        :gold-records-with-pulls="weaponEventGoldRecordsWithPulls"
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
    />

    <GachaDeleteDialog
      v-model:open="deleteDialogOpen"
      :account-id="selectedAccount?.id || ''"
      :account-name="selectedAccount?.name || ''"
      @success="handleDeleteSuccess"
    />
  </div>
</template>
