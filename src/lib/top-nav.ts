import {
  Braces,
  Calculator,
  Clock,
  FileText,
  Fingerprint,
  Globe,
  Hash,
  Info,
  KeyRound,
  Lock,
  MoreHorizontal,
  Shield,
  Timer
} from 'lucide-vue-next'
import type { Component } from 'vue'

export interface TopNavSubItem {
  to: string
  labelKey: string
  icon: Component
}

export interface TopNavModule {
  id: string
  labelKey: string
  prefix: string
  items: TopNavSubItem[]
  /** 是否需要登录才能显示此模块 */
  requireAuth?: boolean
  /** 是否直接跳转，不需要悬浮展示子菜单 */
  directLink?: boolean
}

export const topNavModules: TopNavModule[] = [
  {
    id: 'develop',
    labelKey: 'layout.nav.modules.develop',
    prefix: '/develop',
    items: [
      { to: '/develop/password', labelKey: 'layout.nav.sub.devPassword', icon: KeyRound },
      { to: '/develop/nanoid', labelKey: 'layout.nav.sub.devNanoid', icon: Fingerprint },
      { to: '/develop/json', labelKey: 'layout.nav.sub.devJson', icon: Braces }
    ]
  },
  {
    id: 'crypto',
    labelKey: 'layout.nav.modules.crypto',
    prefix: '/crypto',
    items: [
      { to: '/crypto/md5', labelKey: 'layout.nav.sub.cryptoMd5', icon: Hash },
      { to: '/crypto/base64', labelKey: 'layout.nav.sub.cryptoBase64', icon: FileText },
      { to: '/crypto/jwt', labelKey: 'layout.nav.sub.cryptoJwt', icon: KeyRound },
      { to: '/crypto/sm2', labelKey: 'layout.nav.sub.cryptoSm2', icon: Shield },
      { to: '/crypto/sm4', labelKey: 'layout.nav.sub.cryptoSm4', icon: Lock },
      { to: '/crypto/aes', labelKey: 'layout.nav.sub.cryptoAes', icon: Lock },
      { to: '/crypto/des', labelKey: 'layout.nav.sub.cryptoDes', icon: Lock }
    ]
  },
  {
    id: 'time',
    labelKey: 'layout.nav.modules.time',
    prefix: '/time',
    items: [
      { to: '/time/timestamp', labelKey: 'layout.nav.sub.timeTimestamp', icon: Timer },
      { to: '/time/calculator', labelKey: 'layout.nav.sub.timeCalculator', icon: Calculator },
      { to: '/time/world', labelKey: 'layout.nav.sub.timeWorld', icon: Globe }
    ]
  },
  {
    id: 'text',
    labelKey: 'layout.nav.modules.text',
    prefix: '/text',
    items: [
      { to: '/text/url', labelKey: 'layout.nav.sub.textUrl', icon: Globe },
      { to: '/text/unicode', labelKey: 'layout.nav.sub.textUnicode', icon: FileText },
      { to: '/text/hex', labelKey: 'layout.nav.sub.textHex', icon: Hash }
    ]
  },
  {
    id: 'gacha',
    labelKey: 'layout.nav.modules.gacha',
    prefix: '/gacha',
    items: [
      { to: '/gacha/genshin', labelKey: 'layout.nav.sub.gachaGenshin', icon: FileText },
      { to: '/gacha/starrail', labelKey: 'layout.nav.sub.gachaStarRail', icon: FileText },
      { to: '/gacha/zzz', labelKey: 'layout.nav.sub.gachaZZZ', icon: FileText }
    ],
    requireAuth: true
  },
  {
    id: 'about',
    labelKey: 'layout.nav.modules.about',
    prefix: '/about',
    items: [{ to: '/about', labelKey: 'layout.nav.sub.about', icon: Info }],
    directLink: true
  }
]

export const topNavModuleIcons: Record<string, Component> = {
  develop: Fingerprint,
  crypto: Lock,
  time: Clock,
  text: FileText,
  gacha: MoreHorizontal,
  about: Info
}
