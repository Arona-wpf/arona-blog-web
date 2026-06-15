<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import gachaBaseMap from '@/assets/png/gacha_zzz_base_map.png'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogScrollBody,
  DialogTitle
} from '@/components/ui/dialog'
import { Image } from '@/components/ui/image'
import { Input } from '@/components/ui/input'
import { GachaItemTypeEnum, GameTypeEnum } from '@/definitions/enums/gacha.enum'
import { ResponseCodeEnum } from '@/definitions/enums/request.enums'
import type { GachaAtlasConfigValue, GachaItemType, GameType } from '@/definitions/types/gacha.types'
import { pr_v1_gacha_atlas_list } from '@/fetch/gacha'
import type { GachaAtlasItem } from '@/fetch/gacha/types'
import { cn } from '@/lib/utils'

const props = defineProps<{
  open: boolean
  gameType: GameType
  category: GachaItemType
  mode: 'add' | 'edit'
  originValue: GachaAtlasConfigValue
  confirmLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (
    e: 'confirm',
    value: {
      character: string[]
      weapon: string[]
    }
  ): void
}>()

const { t } = useI18n()

const loading = ref(false)
const atlasList = ref<GachaAtlasItem[]>([])
const characterSearch = ref('')
const weaponSearch = ref('')
const selectedCharacterKeys = ref<Set<string>>(new Set())
const selectedWeaponKeys = ref<Set<string>>(new Set())

const needWeaponBaseMap = computed(() => props.gameType === GameTypeEnum.ZENLESS_ZONE_ZERO)

const characterSectionLabel = computed(() => t(`views.system.gachaAtlas.character.${props.gameType}`))

const weaponSectionLabel = computed(() => t(`views.system.gachaAtlas.weapon.${props.gameType}`))

const dialogDesc = computed(() => t(`views.system.gachaAtlas.dialogDesc.${props.gameType}`))

function isExcludedAtlasItem(item: GachaAtlasItem) {
  if (props.gameType === GameTypeEnum.GENSHIN_IMPACT && item.item_name.includes('旅行者')) {
    return true
  }
  if (props.gameType === GameTypeEnum.HONKAI_STAR_RAIL && item.item_name.includes('开拓者')) {
    return true
  }
  return false
}

const characterItems = computed(() =>
  atlasList.value.filter(
    (item) => item.item_type === GachaItemTypeEnum.CHARACTER && item.icon_url && item._id && !isExcludedAtlasItem(item)
  )
)

const weaponItems = computed(() =>
  atlasList.value.filter((item) => item.item_type === GachaItemTypeEnum.WEAPON && item.icon_url && item._id)
)

const filteredCharacterItems = computed(() => {
  const keyword = characterSearch.value.trim().toLowerCase()
  if (!keyword) return characterItems.value
  return characterItems.value.filter((item) => item.item_name.toLowerCase().includes(keyword))
})

const filteredWeaponItems = computed(() => {
  const keyword = weaponSearch.value.trim().toLowerCase()
  if (!keyword) return weaponItems.value
  return weaponItems.value.filter((item) => item.item_name.toLowerCase().includes(keyword))
})

const showCharacterFirst = computed(() => props.category !== GachaItemTypeEnum.WEAPON)

function resolveAtlasItemKey(item: GachaAtlasItem) {
  return item._id
}

function matchesOriginValue(item: GachaAtlasItem, originList: string[]) {
  return Boolean(item._id) && originList.includes(item._id)
}

function getSelectedItemIds(items: GachaAtlasItem[], selectedKeys: Set<string>) {
  return items.filter((item) => item._id && selectedKeys.has(item._id)).map((item) => item._id)
}

function initSelection() {
  if (props.mode === 'edit') {
    const characterKeys = new Set<string>()
    const weaponKeys = new Set<string>()

    characterItems.value.forEach((item) => {
      if (matchesOriginValue(item, props.originValue.character)) {
        characterKeys.add(resolveAtlasItemKey(item))
      }
    })
    weaponItems.value.forEach((item) => {
      if (matchesOriginValue(item, props.originValue.weapon)) {
        weaponKeys.add(resolveAtlasItemKey(item))
      }
    })

    selectedCharacterKeys.value = characterKeys
    selectedWeaponKeys.value = weaponKeys
    return
  }

  selectedCharacterKeys.value = new Set()
  selectedWeaponKeys.value = new Set()
}

async function fetchAtlasList() {
  loading.value = true
  try {
    const res = await pr_v1_gacha_atlas_list({ game_type: props.gameType })
    if (res.code === ResponseCodeEnum.SUCCESS && res.data) {
      atlasList.value = res.data
      initSelection()
    }
  } finally {
    loading.value = false
  }
}

function handleOpenChange(open: boolean) {
  emit('update:open', open)
}

function toggleCharacterSelection(item: GachaAtlasItem, checked: boolean) {
  if (!item._id) return

  const key = item._id
  const next = new Set(selectedCharacterKeys.value)
  if (checked) {
    next.add(key)
  } else {
    next.delete(key)
  }
  selectedCharacterKeys.value = next
}

function toggleWeaponSelection(item: GachaAtlasItem, checked: boolean) {
  if (!item._id) return

  const key = item._id
  const next = new Set(selectedWeaponKeys.value)
  if (checked) {
    next.add(key)
  } else {
    next.delete(key)
  }
  selectedWeaponKeys.value = next
}

function handleCharacterCheckedChange(item: GachaAtlasItem, checked: boolean | 'indeterminate') {
  toggleCharacterSelection(item, checked === true)
}

function handleWeaponCheckedChange(item: GachaAtlasItem, checked: boolean | 'indeterminate') {
  toggleWeaponSelection(item, checked === true)
}

function handleConfirm() {
  emit('confirm', {
    character: getSelectedItemIds(characterItems.value, selectedCharacterKeys.value),
    weapon: getSelectedItemIds(weaponItems.value, selectedWeaponKeys.value)
  })
}

function getAtlasItemCardClass(selected: boolean) {
  return cn(
    'group flex w-24 cursor-pointer flex-col items-center gap-1 rounded-lg p-1.5 transition-all duration-200',
    'hover:-translate-y-0.5 hover:bg-accent/60 hover:shadow-sm',
    selected && 'bg-primary/5 ring-primary/40 ring-1'
  )
}

const atlasIconClass =
  'relative size-20 overflow-hidden rounded transition-transform duration-200 group-hover:scale-105'
const atlasNameClass = 'text-center text-xs leading-tight break-words transition-colors group-hover:text-foreground'

watch(
  () => props.open,
  (open) => {
    if (!open) return
    characterSearch.value = ''
    weaponSearch.value = ''
    fetchAtlasList()
  }
)
</script>

<template>
  <Dialog :open="props.open" @update:open="handleOpenChange">
    <DialogContent class="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle>{{ t('views.system.gachaAtlas.dialogTitle') }}</DialogTitle>
        <DialogDescription>{{ dialogDesc }}</DialogDescription>
      </DialogHeader>

      <div class="flex min-h-0 flex-1 flex-col">
        <DialogScrollBody class="space-y-6">
          <p v-if="loading" class="text-muted-foreground text-sm">{{ t('views.system.gachaAtlas.loading') }}</p>

          <template v-else>
            <template v-if="showCharacterFirst">
              <section class="space-y-3">
                <h3 class="text-sm font-medium">{{ characterSectionLabel }}</h3>
                <Input
                  v-model="characterSearch"
                  :placeholder="t('views.system.gachaAtlas.searchPlaceholder')"
                  class="max-w-xs"
                />
                <p v-if="filteredCharacterItems.length === 0" class="text-muted-foreground text-sm">
                  {{ t('views.system.gachaAtlas.empty') }}
                </p>
                <div v-else class="flex flex-wrap justify-center gap-3">
                  <div
                    v-for="item in filteredCharacterItems"
                    :key="item._id"
                    :class="getAtlasItemCardClass(selectedCharacterKeys.has(item._id))"
                    @click="toggleCharacterSelection(item, !selectedCharacterKeys.has(item._id))"
                  >
                    <div class="relative">
                      <Checkbox
                        class="bg-background/90 absolute top-0 left-0 z-10"
                        :model-value="selectedCharacterKeys.has(item._id)"
                        @click.stop
                        @update:model-value="handleCharacterCheckedChange(item, $event)"
                      />
                      <div :class="atlasIconClass">
                        <Image :src="item.icon_url" :alt="item.item_name" :title="item.item_name" class="rounded" />
                      </div>
                    </div>
                    <span :class="atlasNameClass">{{ item.item_name }}</span>
                  </div>
                </div>
              </section>

              <section class="space-y-3">
                <h3 class="text-sm font-medium">{{ weaponSectionLabel }}</h3>
                <Input
                  v-model="weaponSearch"
                  :placeholder="t('views.system.gachaAtlas.searchPlaceholder')"
                  class="max-w-xs"
                />
                <p v-if="filteredWeaponItems.length === 0" class="text-muted-foreground text-sm">
                  {{ t('views.system.gachaAtlas.empty') }}
                </p>
                <div v-else class="flex flex-wrap justify-center gap-3">
                  <div
                    v-for="item in filteredWeaponItems"
                    :key="item._id"
                    :class="getAtlasItemCardClass(selectedWeaponKeys.has(item._id))"
                    @click="toggleWeaponSelection(item, !selectedWeaponKeys.has(item._id))"
                  >
                    <div class="relative">
                      <Checkbox
                        class="bg-background/90 absolute top-0 left-0 z-10"
                        :model-value="selectedWeaponKeys.has(item._id)"
                        @click.stop
                        @update:model-value="handleWeaponCheckedChange(item, $event)"
                      />
                      <div :class="atlasIconClass">
                        <img
                          v-if="needWeaponBaseMap"
                          :src="gachaBaseMap"
                          alt="base"
                          class="absolute inset-0 size-full rounded object-cover"
                        />
                        <Image
                          :src="item.icon_url"
                          :alt="item.item_name"
                          :title="item.item_name"
                          class="relative rounded"
                        />
                      </div>
                    </div>
                    <span :class="atlasNameClass">{{ item.item_name }}</span>
                  </div>
                </div>
              </section>
            </template>

            <template v-else>
              <section class="space-y-3">
                <h3 class="text-sm font-medium">{{ weaponSectionLabel }}</h3>
                <Input
                  v-model="weaponSearch"
                  :placeholder="t('views.system.gachaAtlas.searchPlaceholder')"
                  class="max-w-xs"
                />
                <p v-if="filteredWeaponItems.length === 0" class="text-muted-foreground text-sm">
                  {{ t('views.system.gachaAtlas.empty') }}
                </p>
                <div v-else class="flex flex-wrap justify-center gap-3">
                  <div
                    v-for="item in filteredWeaponItems"
                    :key="item._id"
                    :class="getAtlasItemCardClass(selectedWeaponKeys.has(item._id))"
                    @click="toggleWeaponSelection(item, !selectedWeaponKeys.has(item._id))"
                  >
                    <div class="relative">
                      <Checkbox
                        class="bg-background/90 absolute top-0 left-0 z-10"
                        :model-value="selectedWeaponKeys.has(item._id)"
                        @click.stop
                        @update:model-value="handleWeaponCheckedChange(item, $event)"
                      />
                      <div :class="atlasIconClass">
                        <img
                          v-if="needWeaponBaseMap"
                          :src="gachaBaseMap"
                          alt="base"
                          class="absolute inset-0 size-full rounded object-cover"
                        />
                        <Image
                          :src="item.icon_url"
                          :alt="item.item_name"
                          :title="item.item_name"
                          class="relative rounded"
                        />
                      </div>
                    </div>
                    <span :class="atlasNameClass">{{ item.item_name }}</span>
                  </div>
                </div>
              </section>

              <section class="space-y-3">
                <h3 class="text-sm font-medium">{{ characterSectionLabel }}</h3>
                <Input
                  v-model="characterSearch"
                  :placeholder="t('views.system.gachaAtlas.searchPlaceholder')"
                  class="max-w-xs"
                />
                <p v-if="filteredCharacterItems.length === 0" class="text-muted-foreground text-sm">
                  {{ t('views.system.gachaAtlas.empty') }}
                </p>
                <div v-else class="flex flex-wrap justify-center gap-3">
                  <div
                    v-for="item in filteredCharacterItems"
                    :key="item._id"
                    :class="getAtlasItemCardClass(selectedCharacterKeys.has(item._id))"
                    @click="toggleCharacterSelection(item, !selectedCharacterKeys.has(item._id))"
                  >
                    <div class="relative">
                      <Checkbox
                        class="bg-background/90 absolute top-0 left-0 z-10"
                        :model-value="selectedCharacterKeys.has(item._id)"
                        @click.stop
                        @update:model-value="handleCharacterCheckedChange(item, $event)"
                      />
                      <div :class="atlasIconClass">
                        <Image :src="item.icon_url" :alt="item.item_name" :title="item.item_name" class="rounded" />
                      </div>
                    </div>
                    <span :class="atlasNameClass">{{ item.item_name }}</span>
                  </div>
                </div>
              </section>
            </template>
          </template>
        </DialogScrollBody>

        <DialogFooter>
          <Button variant="outline" @click="handleOpenChange(false)">
            {{ t('views.system.gachaAtlas.cancel') }}
          </Button>
          <Button :loading="confirmLoading" :disabled="loading || confirmLoading" @click="handleConfirm">
            {{ t('views.system.gachaAtlas.confirm') }}
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>
</template>
