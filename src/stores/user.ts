import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { Gender } from '@/definitions/types/gender.types'

/** 登录用户信息 */
export interface UserInfo {
  _id: string
  account: string
  nickname: string
  avatar: string
  birthday: string
  gender: Gender
  email: string
  roles: string[]
  permissions: string[]
}

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)

  /** 设置用户信息 */
  function setUserInfo(info: UserInfo) {
    userInfo.value = info
  }

  /** 清除用户信息（登出） */
  function clearUserInfo() {
    userInfo.value = null
  }

  /** 是否已登录 */
  const isLoggedIn = ref(() => userInfo.value !== null)

  return { userInfo, setUserInfo, clearUserInfo, isLoggedIn }
})
