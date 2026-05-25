<script setup lang="ts">
import { Download, Trash2, Upload } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectEmpty, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SERVER_REGION_I18N_KEY_MAP } from '@/definitions/constants/gacha.constants'
import { GameTypeEnum } from '@/definitions/enums/gacha.enum'
import { ResponseCodeEnum } from '@/definitions/enums/request.enums'
import { pr_v1_gacha_config_delete, pr_v1_gacha_config_list } from '@/fetch/gacha'
import type { GachaConfig } from '@/fetch/gacha/types'

import CreateConfigDialog from './dialog/CreateConfigDialog.vue'

const { t } = useI18n()

const selectedConfigId = ref<string>('')
const gachaLink = ref<string>('')
const configList = ref<GachaConfig[]>([])
const loading = ref(false)
const createDialogOpen = ref(false)
const deleteDialogOpen = ref(false)

const regionI18nKeys = SERVER_REGION_I18N_KEY_MAP[GameTypeEnum.GENSHIN_IMPACT] || {}

const accounts = computed(() =>
  configList.value.map((config) => ({
    id: config._id,
    name: `${config.game_nickname} (${t(regionI18nKeys[config.region] || config.region)}-${config.game_uid})`,
    gacha_url: config.gacha_url || ''
  }))
)

const selectedAccount = computed(() => accounts.value.find((a) => a.id === selectedConfigId.value))

watch(selectedConfigId, (newId) => {
  if (newId) {
    const account = accounts.value.find((a) => a.id === newId)
    if (account && account.gacha_url) {
      gachaLink.value = account.gacha_url
    } else {
      gachaLink.value = ''
    }
  } else {
    gachaLink.value = ''
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

onMounted(() => {
  fetchConfigList()
})

function handleUpdate() {}

function handleImport() {}

function handleExport() {}

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

async function handleDeleteConfirm() {
  if (!selectedAccount.value) return
  try {
    const res = await pr_v1_gacha_config_delete({ _id: selectedAccount.value.id })
    if (res.code === ResponseCodeEnum.SUCCESS) {
      deleteDialogOpen.value = false
      selectedConfigId.value = ''
      fetchConfigList()
    }
  } finally {
  }
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
        <div class="flex-1 space-y-2">
          <FormLabel>{{ t('views.gacha.genshin.selectAccount') }}</FormLabel>
          <Select v-model="selectedConfigId">
            <SelectTrigger>
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

        <div class="flex-1 space-y-2">
          <FormLabel>{{ t('views.gacha.genshin.gachaLink') }}</FormLabel>
          <Input v-model="gachaLink" :placeholder="t('views.gacha.genshin.gachaLinkPlaceholder')" />
        </div>
      </div>

      <div class="flex gap-2">
        <Button :disabled="!selectedConfigId || !gachaLink" @click="handleUpdate">
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

    <CreateConfigDialog
      v-model:open="createDialogOpen"
      :game-type="GameTypeEnum.GENSHIN_IMPACT"
      @success="handleDialogSuccess"
    />

    <Dialog v-model:open="deleteDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ t('views.gacha.genshin.deleteTitle') }}</DialogTitle>
          <DialogDescription>
            {{ t('views.gacha.genshin.deleteDesc', { name: selectedAccount?.name || '' }) }}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="deleteDialogOpen = false">
            {{ t('views.gacha.genshin.deleteCancel') }}
          </Button>
          <Button variant="destructive" @click="handleDeleteConfirm">
            {{ t('views.gacha.genshin.deleteConfirm') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
