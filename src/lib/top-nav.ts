import {
  Braces,
  Calculator,
  Clock,
  FileText,
  Fingerprint,
  FolderTree,
  Globe,
  Hash,
  Info,
  KeyRound,
  Lock,
  MoreHorizontal,
  Newspaper,
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
      { to: '/crypto/hash', labelKey: 'layout.nav.sub.cryptoHash', icon: Hash },
      { to: '/crypto/symmetric', labelKey: 'layout.nav.sub.cryptoSymmetric', icon: KeyRound }
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
      { to: '/text/articles', labelKey: 'layout.nav.sub.textArticles', icon: Newspaper },
      { to: '/text/categories', labelKey: 'layout.nav.sub.textCategories', icon: FolderTree }
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
