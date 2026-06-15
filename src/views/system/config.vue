<script setup lang="ts">
import { Plus, RefreshCw } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

import gachaBaseMap from '@/assets/png/gacha_zzz_base_map.png'
import { Button } from '@/components/ui/button'
import { Image } from '@/components/ui/image'
import { GachaItemTypeEnum, GameTypeEnum } from '@/definitions/enums/gacha.enum'
import { ResponseCodeEnum } from '@/definitions/enums/request.enums'
import type { GachaAtlasConfigValue, GameType } from '@/definitions/types/gacha.types'
import { pr_v1_gacha_atlas_items } from '@/fetch/gacha'
import type { GachaAtlasItem } from '@/fetch/gacha/types'
import { pr_v1_config_get, pr_v1_config_set } from '@/fetch/system'
import type { GroupedConfigMap } from '@/fetch/system/types'
import { useUserStore } from '@/stores/user'

import CreateConfigDialog from './dialog/CreateConfigDialog.vue'
import GachaAtlasPickerDialog from './dialog/GachaAtlasPickerDialog.vue'

const { t } = useI18n()
const userStore = useUserStore()

const CONFIG_KEY_TO_GAME_TYPE: Record<string, GameType> = {
  'gacha.genshin.config': GameTypeEnum.GENSHIN_IMPACT,
  'gacha.starrail.config': GameTypeEnum.HONKAI_STAR_RAIL,
  'gacha.zzz.config': GameTypeEnum.ZENLESS_ZONE_ZERO
}

const GAME_TYPE_TO_CONFIG_KEY: Record<GameType, string> = {
  [GameTypeEnum.GENSHIN_IMPACT]: 'gacha.genshin.config',
  [GameTypeEnum.HONKAI_STAR_RAIL]: 'gacha.starrail.config',
  [GameTypeEnum.ZENLESS_ZONE_ZERO]: 'gacha.zzz.config'
}

const isAdministrator = computed(() => userStore.userInfo?.roles?.includes('administrator'))

const gameSections = [
  {
    gameType: GameTypeEnum.GENSHIN_IMPACT,
    titleKey: 'views.system.gachaConfig.genshin.title',
    descKey: 'views.system.gachaConfig.genshin.desc',
    characterLabelKey: 'views.system.gachaAtlas.character.genshin_impact',
    weaponLabelKey: 'views.system.gachaAtlas.weapon.genshin_impact'
  },
  {
    gameType: GameTypeEnum.HONKAI_STAR_RAIL,
    titleKey: 'views.system.gachaConfig.starrail.title',
    descKey: 'views.system.gachaConfig.starrail.desc',
    characterLabelKey: 'views.system.gachaAtlas.character.honkai_star_rail',
    weaponLabelKey: 'views.system.gachaAtlas.weapon.honkai_star_rail'
  },
  {
    gameType: GameTypeEnum.ZENLESS_ZONE_ZERO,
    titleKey: 'views.system.gachaConfig.zzz.title',
    descKey: 'views.system.gachaConfig.zzz.desc',
    characterLabelKey: 'views.system.gachaAtlas.character.zenless_zone_zero',
    weaponLabelKey: 'views.system.gachaAtlas.weapon.zenless_zone_zero'
  }
] as const

const createConfigDialogOpen = ref(false)
const atlasDialogOpen = ref(false)
const atlasDialogMode = ref<'add' | 'edit'>('add')
const atlasConfirmLoading = ref(false)
const activeGameType = ref<GameType>(GameTypeEnum.GENSHIN_IMPACT)
const refreshing = ref(false)
const configGroupMap = ref<GroupedConfigMap>({})

const defaultGachaConfigMap = (): Record<GameType, GachaAtlasConfigValue> => ({
  [GameTypeEnum.GENSHIN_IMPACT]: { character: [], weapon: [] },
  [GameTypeEnum.HONKAI_STAR_RAIL]: { character: [], weapon: [] },
  [GameTypeEnum.ZENLESS_ZONE_ZERO]: { character: [], weapon: [] }
})

const defaultAtlasItemMap = (): Record<GameType, Record<string, GachaAtlasItem>> => ({
  [GameTypeEnum.GENSHIN_IMPACT]: {},
  [GameTypeEnum.HONKAI_STAR_RAIL]: {},
  [GameTypeEnum.ZENLESS_ZONE_ZERO]: {}
})

const gachaConfigMap = ref<Record<GameType, GachaAtlasConfigValue>>(defaultGachaConfigMap())
const atlasItemMap = ref<Record<GameType, Record<string, GachaAtlasItem>>>(defaultAtlasItemMap())

const atlasOriginValue = computed(() => gachaConfigMap.value[activeGameType.value])

function handleCreateConfig() {
  createConfigDialogOpen.value = true
}

function handleCreateConfigSuccess() {
  handleRefreshConfig()
}

function parseGachaConfigValue(value: string): GachaAtlasConfigValue {
  const defaultValue: GachaAtlasConfigValue = { character: [], weapon: [] }
  if (!value) return defaultValue

  try {
    const parsed = JSON.parse(value) as Partial<GachaAtlasConfigValue>
    if (!parsed || typeof parsed !== 'object') return defaultValue

    return {
      character: Array.isArray(parsed.character) ? parsed.character.map((item) => String(item)) : [],
      weapon: Array.isArray(parsed.weapon) ? parsed.weapon.map((item) => String(item)) : []
    }
  } catch {
    return defaultValue
  }
}

async function loadAtlasItemsForGame(gameType: GameType) {
  const config = gachaConfigMap.value[gameType]
  const ids = [...new Set([...config.character, ...config.weapon])]

  if (ids.length === 0) {
    atlasItemMap.value[gameType] = {}
    return
  }

  const res = await pr_v1_gacha_atlas_items({
    game_type: gameType,
    ids
  })

  if (res.code === ResponseCodeEnum.SUCCESS && res.data) {
    const itemMap: Record<string, GachaAtlasItem> = {}
    for (const item of res.data) {
      if (item._id) {
        itemMap[item._id] = item
      }
    }
    atlasItemMap.value[gameType] = itemMap
  }
}

async function handleRefreshConfig() {
  if (refreshing.value) return

  refreshing.value = true
  try {
    const res = await pr_v1_config_get()
    if (res.code === ResponseCodeEnum.SUCCESS && res.data) {
      configGroupMap.value = res.data || {}

      // 先加载 atlas 数据，再更新配置，避免渲染时显示占位符
      const nextMap = defaultGachaConfigMap()
      configGroupMap.value.gacha?.forEach((item) => {
        const gameType = CONFIG_KEY_TO_GAME_TYPE[item.key]
        if (!gameType) return
        nextMap[gameType] = parseGachaConfigValue(item.value)
      })

      // 根据 configMap 中的 ids 加载 atlas 数据
      const atlasLoadingPromises = gameSections.map(async (section) => {
        const config = nextMap[section.gameType]
        const ids = [...new Set([...config.character, ...config.weapon])]
        if (ids.length === 0) return

        const atlasRes = await pr_v1_gacha_atlas_items({
          game_type: section.gameType,
          ids
        })
        if (atlasRes.code === ResponseCodeEnum.SUCCESS && atlasRes.data) {
          const itemMap: Record<string, GachaAtlasItem> = {}
          for (const item of atlasRes.data) {
            if (item._id) {
              itemMap[item._id] = item
            }
          }
          atlasItemMap.value[section.gameType] = itemMap
        }
      })
      await Promise.all(atlasLoadingPromises)

      // 最后更新 configMap，触发渲染时 atlas 数据已准备好
      gachaConfigMap.value = nextMap
      toast.success(res.msg || t('views.system.gachaConfig.refreshDone'))
    }
  } finally {
    refreshing.value = false
  }
}

function getItemIds(gameType: GameType, category: keyof GachaAtlasConfigValue) {
  return gachaConfigMap.value[gameType]?.[category] ?? []
}

function getAtlasItem(gameType: GameType, itemId: string) {
  return atlasItemMap.value[gameType]?.[itemId]
}

function needWeaponBaseMap(gameType: GameType) {
  return gameType === GameTypeEnum.ZENLESS_ZONE_ZERO
}

async function handleAtlasConfirm(value: GachaAtlasConfigValue) {
  const gameType = activeGameType.value
  const configKey = GAME_TYPE_TO_CONFIG_KEY[gameType]

  atlasConfirmLoading.value = true
  try {
    const res = await pr_v1_config_set({
      key: configKey,
      value: JSON.stringify(value)
    })

    if (res.code === ResponseCodeEnum.SUCCESS) {
      gachaConfigMap.value[gameType] = value
      await loadAtlasItemsForGame(gameType)
      atlasDialogOpen.value = false
      toast.success(res.msg || t('views.system.gachaConfig.saveSuccess'))
    }
  } finally {
    atlasConfirmLoading.value = false
  }
}

function handleOpenAtlasConfig(gameType: GameType) {
  activeGameType.value = gameType
  const config = gachaConfigMap.value[gameType]
  atlasDialogMode.value = config.character.length > 0 || config.weapon.length > 0 ? 'edit' : 'add'
  atlasDialogOpen.value = true
}

onMounted(() => {
  if (isAdministrator.value) {
    handleRefreshConfig()
  }
})
</script>

<template>
  <div class="space-y-6 px-2 sm:px-4">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="space-y-2">
        <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.system.config.title') }}</h1>
        <p class="text-muted-foreground text-sm">{{ t('views.system.config.subtitle') }}</p>
      </div>

      <div v-if="isAdministrator" class="flex flex-wrap gap-2 sm:shrink-0">
        <Button class="gap-2" @click="handleCreateConfig">
          <Plus class="size-4" />
          {{ t('views.system.gachaConfig.create') }}
        </Button>
        <Button
          variant="outline"
          class="gap-2"
          :loading="refreshing"
          :disabled="refreshing"
          @click="handleRefreshConfig"
        >
          <RefreshCw class="size-4" />
          {{ t('views.system.gachaConfig.refresh') }}
        </Button>
      </div>
    </div>

    <div v-if="!isAdministrator" class="flex min-h-[12rem] items-center justify-center">
      <p class="text-muted-foreground">{{ t('views.system.config.noPermission') }}</p>
    </div>

    <template v-else>
      <section class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">{{ t('views.system.gachaConfig.title') }}</h2>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div
            v-for="section in gameSections"
            :key="section.gameType"
            class="border-border/60 rounded-xl border p-4 shadow-sm sm:p-5"
          >
            <div class="flex items-center justify-between gap-3">
              <h3 class="text-base font-medium">{{ t(section.titleKey) }}</h3>
              <Button size="sm" variant="outline" @click="handleOpenAtlasConfig(section.gameType)">
                {{ t('views.system.gachaConfig.configure') }}
              </Button>
            </div>
            <p class="text-muted-foreground mt-2 text-sm leading-relaxed">{{ t(section.descKey) }}</p>

            <div class="mt-4 grid grid-cols-1 gap-3">
              <div class="space-y-2">
                <h4 class="text-sm font-medium">{{ t(section.characterLabelKey) }}</h4>
                <div v-if="getItemIds(section.gameType, 'character').length > 0" class="flex flex-wrap gap-2">
                  <div
                    v-for="itemId in getItemIds(section.gameType, 'character')"
                    :key="`${section.gameType}-character-${itemId}`"
                    class="flex flex-col items-center gap-1"
                  >
                    <div class="relative size-18">
                      <Image
                        v-if="getAtlasItem(section.gameType, itemId)?.icon_url"
                        :src="getAtlasItem(section.gameType, itemId)!.icon_url"
                        :alt="getAtlasItem(section.gameType, itemId)?.item_name || itemId"
                        :title="getAtlasItem(section.gameType, itemId)?.item_name || itemId"
                        class="rounded"
                      />
                      <div
                        v-else
                        class="bg-muted text-muted-foreground flex size-full items-center justify-center rounded text-xs"
                      >
                        ?
                      </div>
                    </div>
                    <span class="text-xs text-center leading-tight break-words max-w-16">
                      {{ getAtlasItem(section.gameType, itemId)?.item_name || itemId }}
                    </span>
                  </div>
                </div>
                <p v-else class="text-muted-foreground text-xs">{{ t('views.system.gachaConfig.emptyItems') }}</p>
              </div>

              <div class="space-y-2">
                <h4 class="text-sm font-medium">{{ t(section.weaponLabelKey) }}</h4>
                <div v-if="getItemIds(section.gameType, 'weapon').length > 0" class="flex flex-wrap gap-2">
                  <div
                    v-for="itemId in getItemIds(section.gameType, 'weapon')"
                    :key="`${section.gameType}-weapon-${itemId}`"
                    class="flex flex-col items-center gap-1"
                  >
                    <div class="relative size-18">
                      <img
                        v-if="needWeaponBaseMap(section.gameType)"
                        :src="gachaBaseMap"
                        alt="base"
                        class="absolute inset-0 size-full rounded object-cover"
                      />
                      <Image
                        v-if="getAtlasItem(section.gameType, itemId)?.icon_url"
                        :src="getAtlasItem(section.gameType, itemId)!.icon_url"
                        :alt="getAtlasItem(section.gameType, itemId)?.item_name || itemId"
                        :title="getAtlasItem(section.gameType, itemId)?.item_name || itemId"
                        class="relative rounded"
                      />
                      <div
                        v-else
                        class="bg-muted text-muted-foreground relative flex size-full items-center justify-center rounded text-xs"
                      >
                        ?
                      </div>
                    </div>
                    <span class="text-xs text-center leading-tight break-words max-w-16">
                      {{ getAtlasItem(section.gameType, itemId)?.item_name || itemId }}
                    </span>
                  </div>
                </div>
                <p v-else class="text-muted-foreground text-xs">{{ t('views.system.gachaConfig.emptyItems') }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CreateConfigDialog v-model:open="createConfigDialogOpen" @success="handleCreateConfigSuccess" />

      <GachaAtlasPickerDialog
        v-model:open="atlasDialogOpen"
        :game-type="activeGameType"
        :category="GachaItemTypeEnum.CHARACTER"
        :mode="atlasDialogMode"
        :origin-value="atlasOriginValue"
        :confirm-loading="atlasConfirmLoading"
        @confirm="handleAtlasConfirm"
      />
    </template>
  </div>
</template>
