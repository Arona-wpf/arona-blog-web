import { ResponseCodeEnum } from '@/definitions/enums/request.enums'
import type { GameType } from '@/definitions/types/gacha.types'
import { pr_v1_gacha_script_download } from '@/fetch/gacha'
import { silentDownload } from '@/lib/utils'

/** 下载对应游戏的祈愿脚本 */
export async function downloadGachaScript(gameType: GameType) {
  const res = await pr_v1_gacha_script_download({ game_type: gameType })
  if (res.code === ResponseCodeEnum.SUCCESS && res.data?.url) {
    silentDownload(res.data.url)
  }
}
