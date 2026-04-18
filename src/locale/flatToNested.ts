import { merge } from 'lodash'

/** 将 `global.date.year` 形式的扁平键转为嵌套对象，供 vue-i18n 按点路径解析 */
export function flatToNested(flat: Record<string, string>): Record<string, unknown> {
  const root: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(flat)) {
    if (typeof val !== 'string') continue
    const parts = key.split('.')
    let node: Record<string, unknown> = root
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i]
      const next = node[p!]
      if (next === undefined || typeof next !== 'object' || Array.isArray(next)) {
        node[p!] = {}
      }
      node = node[p!] as Record<string, unknown>
    }
    node[parts[parts.length - 1]!] = val
  }
  return root
}

export function mergeFlatLocaleParts(...flats: Record<string, string>[]) {
  return merge({}, ...flats.map((f) => flatToNested(f)))
}
