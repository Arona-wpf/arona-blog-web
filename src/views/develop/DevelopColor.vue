<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table'
import { useClipboard } from '@vueuse/core'
import { computed, h, ref } from 'vue'
import { RGBSliders, SketchPicker, tinycolor } from 'vue-color'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'

const { t } = useI18n()
const { copy } = useClipboard()

// ==================== 颜色选择器 (vue-color) ====================

const pickerColor = ref('#3B82F6')

// 使用 tinycolor 解析颜色获取各种格式
const pickerTinyColor = computed(() => tinycolor(pickerColor.value))

const pickerHex = computed(() => pickerTinyColor.value.toHexString())

const pickerRgb = computed(() => {
  const rgb = pickerTinyColor.value.toRgb()
  return { r: rgb.r, g: rgb.g, b: rgb.b, a: rgb.a }
})

const pickerHsl = computed(() => {
  const hsl = pickerTinyColor.value.toHsl()
  return { h: Math.round(hsl.h), s: Math.round(hsl.s * 100), l: Math.round(hsl.l * 100), a: hsl.a }
})

// 复制颜色值
function copyColor(value: string) {
  if (!value) return
  copy(value).then(() => {
    toast.success(t('views.dev.copySuccess'))
  })
}

// ==================== 颜色码对照表 ====================

interface ColorReference {
  name: string
  nameEn: string
  descriptionKey: string
  hex: string
  rgb: string
}

const colorReferences: ColorReference[] = [
  // 红色系
  { name: '红色', nameEn: 'Red', descriptionKey: 'Red', hex: '#FF0000', rgb: 'rgb(255, 0, 0)' },
  { name: '深红', nameEn: 'DarkRed', descriptionKey: 'DarkRed', hex: '#8B0000', rgb: 'rgb(139, 0, 0)' },
  { name: '印度红', nameEn: 'IndianRed', descriptionKey: 'IndianRed', hex: '#CD5C5C', rgb: 'rgb(205, 92, 92)' },
  { name: '栗色', nameEn: 'Maroon', descriptionKey: 'Maroon', hex: '#800000', rgb: 'rgb(128, 0, 0)' },
  { name: '浅珊瑚', nameEn: 'LightCoral', descriptionKey: 'LightCoral', hex: '#F08080', rgb: 'rgb(240, 128, 128)' },
  { name: '鲑鱼色', nameEn: 'Salmon', descriptionKey: 'Salmon', hex: '#FA8072', rgb: 'rgb(250, 128, 114)' },
  { name: '深鲑鱼', nameEn: 'DarkSalmon', descriptionKey: 'DarkSalmon', hex: '#E9967A', rgb: 'rgb(233, 150, 122)' },
  { name: '浅鲑鱼', nameEn: 'LightSalmon', descriptionKey: 'LightSalmon', hex: '#FFA07A', rgb: 'rgb(255, 160, 122)' },
  { name: '深粉', nameEn: 'DeepPink', descriptionKey: 'DeepPink', hex: '#FF1493', rgb: 'rgb(255, 20, 147)' },
  { name: '粉红', nameEn: 'Pink', descriptionKey: 'Pink', hex: '#FFC0CB', rgb: 'rgb(255, 192, 203)' },
  { name: '浅粉', nameEn: 'LightPink', descriptionKey: 'LightPink', hex: '#FFB6C1', rgb: 'rgb(255, 182, 193)' },
  { name: '热粉', nameEn: 'HotPink', descriptionKey: 'HotPink', hex: '#FF69B4', rgb: 'rgb(255, 105, 180)' },
  {
    name: '中紫红',
    nameEn: 'MediumVioletRed',
    descriptionKey: 'MediumVioletRed',
    hex: '#C71585',
    rgb: 'rgb(199, 21, 133)'
  },
  {
    name: '苍白紫红',
    nameEn: 'PaleVioletRed',
    descriptionKey: 'PaleVioletRed',
    hex: '#DB7093',
    rgb: 'rgb(219, 112, 147)'
  },
  { name: '玫红', nameEn: 'Crimson', descriptionKey: 'Crimson', hex: '#DC143C', rgb: 'rgb(220, 20, 60)' },
  { name: '火砖色', nameEn: 'FireBrick', descriptionKey: 'FireBrick', hex: '#B22222', rgb: 'rgb(178, 34, 34)' },
  { name: '珊瑚色', nameEn: 'Coral', descriptionKey: 'Coral', hex: '#FF7F50', rgb: 'rgb(255, 127, 80)' },
  { name: '番茄色', nameEn: 'Tomato', descriptionKey: 'Tomato', hex: '#FF6347', rgb: 'rgb(255, 99, 71)' },
  { name: '橙红', nameEn: 'OrangeRed', descriptionKey: 'OrangeRed', hex: '#FF4500', rgb: 'rgb(255, 69, 0)' },
  { name: '玫瑰棕', nameEn: 'RosyBrown', descriptionKey: 'RosyBrown', hex: '#BC8F8F', rgb: 'rgb(188, 143, 143)' },

  // 橙色系
  { name: '橙色', nameEn: 'Orange', descriptionKey: 'Orange', hex: '#FFA500', rgb: 'rgb(255, 165, 0)' },
  { name: '深橙', nameEn: 'DarkOrange', descriptionKey: 'DarkOrange', hex: '#FF8C00', rgb: 'rgb(255, 140, 0)' },
  { name: '珊瑚橙', nameEn: 'Coral', descriptionKey: 'CoralOrange', hex: '#FF7F50', rgb: 'rgb(255, 127, 80)' },

  // 黄色系
  { name: '黄色', nameEn: 'Yellow', descriptionKey: 'Yellow', hex: '#FFFF00', rgb: 'rgb(255, 255, 0)' },
  { name: '浅黄', nameEn: 'LightYellow', descriptionKey: 'LightYellow', hex: '#FFFFE0', rgb: 'rgb(255, 255, 224)' },
  { name: '柠檬绸', nameEn: 'LemonChiffon', descriptionKey: 'LemonChiffon', hex: '#FFFACD', rgb: 'rgb(255, 250, 205)' },
  {
    name: '浅金菊黄',
    nameEn: 'LightGoldenrodYellow',
    descriptionKey: 'LightGoldenrodYellow',
    hex: '#FAFAD2',
    rgb: 'rgb(250, 250, 210)'
  },
  { name: '金色', nameEn: 'Gold', descriptionKey: 'Gold', hex: '#FFD700', rgb: 'rgb(255, 215, 0)' },
  { name: '金菊色', nameEn: 'Goldenrod', descriptionKey: 'Goldenrod', hex: '#DAA520', rgb: 'rgb(218, 165, 32)' },
  {
    name: '深金菊',
    nameEn: 'DarkGoldenrod',
    descriptionKey: 'DarkGoldenrod',
    hex: '#B8860B',
    rgb: 'rgb(184, 134, 11)'
  },
  { name: '玉米丝色', nameEn: 'Corn silk', descriptionKey: 'CornSilk', hex: '#FFF8DC', rgb: 'rgb(255, 248, 220)' },
  { name: '番木瓜色', nameEn: 'PapayaWhip', descriptionKey: 'PapayaWhip', hex: '#FFEFD5', rgb: 'rgb(255, 239, 213)' },
  { name: '桃色', nameEn: 'PeachPuff', descriptionKey: 'PeachPuff', hex: '#FFDAB9', rgb: 'rgb(255, 218, 185)' },
  { name: '莫卡辛', nameEn: 'Moccasin', descriptionKey: 'Moccasin', hex: '#FFE4B5', rgb: 'rgb(255, 228, 181)' },
  { name: '纳瓦白', nameEn: 'NavajoWhite', descriptionKey: 'NavajoWhite', hex: '#FFDEAD', rgb: 'rgb(255, 222, 173)' },
  { name: '黄绿', nameEn: 'YellowGreen', descriptionKey: 'YellowGreen', hex: '#9ACD32', rgb: 'rgb(154, 205, 50)' },
  { name: '草绿', nameEn: 'LawnGreen', descriptionKey: 'LawnGreen', hex: '#7CFC00', rgb: 'rgb(124, 252, 0)' },
  { name: '查特酒绿', nameEn: 'Chartreuse', descriptionKey: 'Chartreuse', hex: '#7FFF00', rgb: 'rgb(127, 255, 0)' },
  { name: '橄榄黄', nameEn: 'OliveDrab', descriptionKey: 'OliveDrab', hex: '#6B8E23', rgb: 'rgb(107, 142, 35)' },
  { name: '米色', nameEn: 'Beige', descriptionKey: 'Beige', hex: '#F5F5DC', rgb: 'rgb(245, 245, 220)' },

  // 绿色系
  { name: '绿色', nameEn: 'Green', descriptionKey: 'Green', hex: '#008000', rgb: 'rgb(0, 128, 0)' },
  { name: '亮绿', nameEn: 'Lime', descriptionKey: 'Lime', hex: '#00FF00', rgb: 'rgb(0, 255, 0)' },
  { name: '亮绿绿', nameEn: 'LimeGreen', descriptionKey: 'LimeGreen', hex: '#32CD32', rgb: 'rgb(50, 205, 50)' },
  { name: '深绿', nameEn: 'DarkGreen', descriptionKey: 'DarkGreen', hex: '#006400', rgb: 'rgb(0, 100, 0)' },
  { name: '浅绿', nameEn: 'LightGreen', descriptionKey: 'LightGreen', hex: '#90EE90', rgb: 'rgb(144, 238, 144)' },
  { name: '森林绿', nameEn: 'ForestGreen', descriptionKey: 'ForestGreen', hex: '#228B22', rgb: 'rgb(34, 139, 34)' },
  { name: '海绿', nameEn: 'SeaGreen', descriptionKey: 'SeaGreen', hex: '#2E8B57', rgb: 'rgb(46, 139, 87)' },
  {
    name: '中海绿',
    nameEn: 'MediumSeaGreen',
    descriptionKey: 'MediumSeaGreen',
    hex: '#3CB371',
    rgb: 'rgb(60, 179, 113)'
  },
  { name: '深海绿', nameEn: 'DarkSeaGreen', descriptionKey: 'DarkSeaGreen', hex: '#8FBC8F', rgb: 'rgb(143, 188, 143)' },
  {
    name: '浅海绿',
    nameEn: 'LightSeaGreen',
    descriptionKey: 'LightSeaGreen',
    hex: '#20B2AA',
    rgb: 'rgb(32, 178, 170)'
  },
  { name: '春绿', nameEn: 'SpringGreen', descriptionKey: 'SpringGreen', hex: '#00FF7F', rgb: 'rgb(0, 255, 127)' },
  {
    name: '中春绿',
    nameEn: 'MediumSpringGreen',
    descriptionKey: 'MediumSpringGreen',
    hex: '#00FA9A',
    rgb: 'rgb(0, 250, 154)'
  },
  { name: '苍白绿', nameEn: 'PaleGreen', descriptionKey: 'PaleGreen', hex: '#98FB98', rgb: 'rgb(152, 251, 152)' },
  { name: '橄榄色', nameEn: 'Olive', descriptionKey: 'Olive', hex: '#808000', rgb: 'rgb(128, 128, 0)' },
  {
    name: '深橄榄绿',
    nameEn: 'DarkOliveGreen',
    descriptionKey: 'DarkOliveGreen',
    hex: '#556B2F',
    rgb: 'rgb(85, 107, 47)'
  },
  { name: '绿豆色', nameEn: 'GreenYellow', descriptionKey: 'GreenYellow', hex: '#ADFF2F', rgb: 'rgb(173, 255, 47)' },

  // 青色系
  { name: '青色', nameEn: 'Cyan', descriptionKey: 'Cyan', hex: '#00FFFF', rgb: 'rgb(0, 255, 255)' },
  { name: '浅青', nameEn: 'LightCyan', descriptionKey: 'LightCyan', hex: '#E0FFFF', rgb: 'rgb(224, 255, 255)' },
  { name: '深青', nameEn: 'DarkCyan', descriptionKey: 'DarkCyan', hex: '#008B8B', rgb: 'rgb(0, 139, 139)' },
  { name: '蓝绿', nameEn: 'Teal', descriptionKey: 'Teal', hex: '#008080', rgb: 'rgb(0, 128, 128)' },
  { name: '水色', nameEn: 'Aqua', descriptionKey: 'Aqua', hex: '#00FFFF', rgb: 'rgb(0, 255, 255)' },
  {
    name: '中蓝绿',
    nameEn: 'MediumAquamarine',
    descriptionKey: 'MediumAquamarine',
    hex: '#66CDAA',
    rgb: 'rgb(102, 205, 170)'
  },
  { name: '碧绿', nameEn: 'Aquamarine', descriptionKey: 'Aquamarine', hex: '#7FFFD4', rgb: 'rgb(127, 255, 212)' },

  // 蓝色系
  { name: '蓝色', nameEn: 'Blue', descriptionKey: 'Blue', hex: '#0000FF', rgb: 'rgb(0, 0, 255)' },
  { name: '深蓝', nameEn: 'DarkBlue', descriptionKey: 'DarkBlue', hex: '#00008B', rgb: 'rgb(0, 0, 139)' },
  { name: '中蓝', nameEn: 'MediumBlue', descriptionKey: 'MediumBlue', hex: '#0000CD', rgb: 'rgb(0, 0, 205)' },
  { name: '海军蓝', nameEn: 'Navy', descriptionKey: 'Navy', hex: '#000080', rgb: 'rgb(0, 0, 128)' },
  { name: '午夜蓝', nameEn: 'MidnightBlue', descriptionKey: 'MidnightBlue', hex: '#191970', rgb: 'rgb(25, 25, 112)' },
  { name: '浅蓝', nameEn: 'LightBlue', descriptionKey: 'LightBlue', hex: '#ADD8E6', rgb: 'rgb(173, 216, 230)' },
  { name: '粉蓝', nameEn: 'PowderBlue', descriptionKey: 'PowderBlue', hex: '#B0E0E6', rgb: 'rgb(176, 224, 230)' },
  { name: '天蓝', nameEn: 'SkyBlue', descriptionKey: 'SkyBlue', hex: '#87CEEB', rgb: 'rgb(135, 206, 235)' },
  { name: '深天蓝', nameEn: 'DeepSkyBlue', descriptionKey: 'DeepSkyBlue', hex: '#00BFFF', rgb: 'rgb(0, 191, 255)' },
  { name: '浅天蓝', nameEn: 'LightSkyBlue', descriptionKey: 'LightSkyBlue', hex: '#87CEFA', rgb: 'rgb(135, 206, 250)' },
  { name: '道奇蓝', nameEn: 'DodgerBlue', descriptionKey: 'DodgerBlue', hex: '#1E90FF', rgb: 'rgb(30, 144, 255)' },
  { name: '钢蓝', nameEn: 'SteelBlue', descriptionKey: 'SteelBlue', hex: '#4682B4', rgb: 'rgb(70, 130, 180)' },
  {
    name: '浅钢蓝',
    nameEn: 'LightSteelBlue',
    descriptionKey: 'LightSteelBlue',
    hex: '#B0C4DE',
    rgb: 'rgb(176, 196, 222)'
  },
  { name: '皇家蓝', nameEn: 'RoyalBlue', descriptionKey: 'RoyalBlue', hex: '#4169E1', rgb: 'rgb(65, 105, 225)' },
  { name: '军校蓝', nameEn: 'CadetBlue', descriptionKey: 'CadetBlue', hex: '#5F9EA0', rgb: 'rgb(95, 158, 160)' },
  {
    name: '矢车菊蓝',
    nameEn: 'CornflowerBlue',
    descriptionKey: 'CornflowerBlue',
    hex: '#6495ED',
    rgb: 'rgb(100, 149, 237)'
  },
  {
    name: '暗板岩蓝',
    nameEn: 'DarkSlateBlue',
    descriptionKey: 'DarkSlateBlue',
    hex: '#483D8B',
    rgb: 'rgb(72, 61, 139)'
  },
  {
    name: '中板岩蓝',
    nameEn: 'MediumSlateBlue',
    descriptionKey: 'MediumSlateBlue',
    hex: '#7B68EE',
    rgb: 'rgb(123, 104, 238)'
  },
  { name: '板岩蓝', nameEn: 'SlateBlue', descriptionKey: 'SlateBlue', hex: '#6A5ACD', rgb: 'rgb(106, 90, 205)' },
  { name: '幽灵白', nameEn: 'GhostWhite', descriptionKey: 'GhostWhite', hex: '#F8F8FF', rgb: 'rgb(248, 248, 255)' },
  { name: '爱丽丝蓝', nameEn: 'AliceBlue', descriptionKey: 'AliceBlue', hex: '#F0F8FF', rgb: 'rgb(240, 248, 255)' },
  { name: '淡蓝', nameEn: 'Azure', descriptionKey: 'Azure', hex: '#F0FFFF', rgb: 'rgb(240, 255, 255)' },

  // 紫色系
  { name: '紫色', nameEn: 'Purple', descriptionKey: 'Purple', hex: '#800080', rgb: 'rgb(128, 0, 128)' },
  { name: '深紫', nameEn: 'DarkMagenta', descriptionKey: 'DarkMagenta', hex: '#8B008B', rgb: 'rgb(139, 0, 139)' },
  { name: '中紫', nameEn: 'MediumPurple', descriptionKey: 'MediumPurple', hex: '#9370DB', rgb: 'rgb(147, 112, 219)' },
  { name: '蓝紫', nameEn: 'BlueViolet', descriptionKey: 'BlueViolet', hex: '#8A2BE2', rgb: 'rgb(138, 43, 226)' },
  {
    name: '中蓝紫',
    nameEn: 'MediumVioletRed',
    descriptionKey: 'MediumVioletRed2',
    hex: '#C71585',
    rgb: 'rgb(199, 21, 133)'
  },
  { name: '暗紫', nameEn: 'DarkViolet', descriptionKey: 'DarkViolet', hex: '#9400D3', rgb: 'rgb(148, 0, 211)' },
  { name: '深兰花紫', nameEn: 'DarkOrchid', descriptionKey: 'DarkOrchid', hex: '#9932CC', rgb: 'rgb(153, 50, 204)' },
  { name: '兰花紫', nameEn: 'Orchid', descriptionKey: 'Orchid', hex: '#DA70D6', rgb: 'rgb(218, 114, 214)' },
  {
    name: '中兰花紫',
    nameEn: 'MediumOrchid',
    descriptionKey: 'MediumOrchid',
    hex: '#BA55D3',
    rgb: 'rgb(186, 85, 211)'
  },
  { name: '淡紫', nameEn: 'Lavender', descriptionKey: 'Lavender', hex: '#E6E6FA', rgb: 'rgb(230, 230, 250)' },
  {
    name: '淡紫红',
    nameEn: 'LavenderBlush',
    descriptionKey: 'LavenderBlush',
    hex: '#FFF0F5',
    rgb: 'rgb(255, 240, 245)'
  },
  { name: '蓟色', nameEn: 'Thistle', descriptionKey: 'Thistle', hex: '#D8BFD8', rgb: 'rgb(216, 191, 216)' },
  { name: '紫红', nameEn: 'Fuchsia', descriptionKey: 'Fuchsia', hex: '#FF00FF', rgb: 'rgb(255, 0, 255)' },
  { name: '品红', nameEn: 'Magenta', descriptionKey: 'Magenta', hex: '#FF00FF', rgb: 'rgb(255, 0, 255)' },
  { name: '紫罗兰', nameEn: 'Violet', descriptionKey: 'Violet', hex: '#EE82EE', rgb: 'rgb(238, 130, 238)' },
  { name: '深紫红', nameEn: 'DeepPink', descriptionKey: 'DeepPink2', hex: '#FF1493', rgb: 'rgb(255, 20, 147)' },
  { name: '靛青', nameEn: 'Indigo', descriptionKey: 'Indigo', hex: '#4B0082', rgb: 'rgb(75, 0, 130)' },
  { name: '李子色', nameEn: 'Plum', descriptionKey: 'Plum', hex: '#DDA0DD', rgb: 'rgb(221, 160, 221)' },
  {
    name: '丽贝卡紫',
    nameEn: 'RebeccaPurple',
    descriptionKey: 'RebeccaPurple',
    hex: '#663399',
    rgb: 'rgb(102, 51, 153)'
  },

  // 灰色系
  { name: '黑色', nameEn: 'Black', descriptionKey: 'Black', hex: '#000000', rgb: 'rgb(0, 0, 0)' },
  { name: '白色', nameEn: 'White', descriptionKey: 'White', hex: '#FFFFFF', rgb: 'rgb(255, 255, 255)' },
  { name: '灰色', nameEn: 'Gray', descriptionKey: 'Gray', hex: '#808080', rgb: 'rgb(128, 128, 128)' },
  { name: '浅灰', nameEn: 'LightGray', descriptionKey: 'LightGray', hex: '#D3D3D3', rgb: 'rgb(211, 211, 211)' },
  { name: '深灰', nameEn: 'DarkGray', descriptionKey: 'DarkGray', hex: '#A9A9A9', rgb: 'rgb(169, 169, 169)' },
  { name: '昏灰', nameEn: 'DimGray', descriptionKey: 'DimGray', hex: '#696969', rgb: 'rgb(105, 105, 105)' },
  { name: '银色', nameEn: 'Silver', descriptionKey: 'Silver', hex: '#C0C0C0', rgb: 'rgb(192, 192, 192)' },
  { name: '烟白', nameEn: 'WhiteSmoke', descriptionKey: 'WhiteSmoke', hex: '#F5F5F5', rgb: 'rgb(245, 245, 245)' },
  { name: '庚斯博罗灰', nameEn: 'Gainsboro', descriptionKey: 'Gainsboro', hex: '#DCDCDC', rgb: 'rgb(220, 220, 220)' },
  { name: '板岩灰', nameEn: 'SlateGray', descriptionKey: 'SlateGray', hex: '#708090', rgb: 'rgb(112, 128, 144)' },
  {
    name: '浅板岩灰',
    nameEn: 'LightSlateGray',
    descriptionKey: 'LightSlateGray',
    hex: '#778899',
    rgb: 'rgb(119, 136, 153)'
  },
  {
    name: '暗板岩灰',
    nameEn: 'DarkSlateGray',
    descriptionKey: 'DarkSlateGray',
    hex: '#2F4F4F',
    rgb: 'rgb(47, 79, 79)'
  },
  { name: '雪白', nameEn: 'Snow', descriptionKey: 'Snow', hex: '#FFFAFA', rgb: 'rgb(255, 250, 250)' },
  { name: '象牙白', nameEn: 'Ivory', descriptionKey: 'Ivory', hex: '#FFFFF0', rgb: 'rgb(255, 255, 240)' },
  { name: '亚麻色', nameEn: 'Linen', descriptionKey: 'Linen', hex: '#FAF0E6', rgb: 'rgb(250, 240, 230)' },
  { name: '灰白', nameEn: 'GrayishWhite', descriptionKey: 'GrayishWhite', hex: '#F5F5F5', rgb: 'rgb(245, 245, 245)' },
  { name: '薄雾玫瑰', nameEn: 'MistyRose', descriptionKey: 'MistyRose', hex: '#FFE4E1', rgb: 'rgb(255, 228, 225)' },
  { name: '蜜露色', nameEn: 'Honeydew', descriptionKey: 'Honeydew', hex: '#F0FFF0', rgb: 'rgb(240, 255, 240)' },
  { name: '薄荷奶油', nameEn: 'MintCream', descriptionKey: 'MintCream', hex: '#F5FFFA', rgb: 'rgb(245, 255, 250)' },
  { name: '花白', nameEn: 'FloralWhite', descriptionKey: 'FloralWhite', hex: '#FFFAF0', rgb: 'rgb(255, 250, 240)' },
  { name: '古董白', nameEn: 'AntiqueWhite', descriptionKey: 'AntiqueWhite', hex: '#FAEBD7', rgb: 'rgb(250, 235, 215)' },
  {
    name: '漂白杏仁',
    nameEn: 'BlanchedAlmond',
    descriptionKey: 'BlanchedAlmond',
    hex: '#FFEBCD',
    rgb: 'rgb(255, 235, 205)'
  },
  { name: '贝壳色', nameEn: 'SeaShell', descriptionKey: 'SeaShell', hex: '#FFF5EE', rgb: 'rgb(255, 245, 238)' },
  { name: '老蕾丝色', nameEn: 'OldLace', descriptionKey: 'OldLace', hex: '#FDF5E6', rgb: 'rgb(253, 245, 230)' },

  // 棕色系
  { name: '棕色', nameEn: 'Brown', descriptionKey: 'Brown', hex: '#A52A2A', rgb: 'rgb(165, 42, 42)' },
  { name: '马鞍棕', nameEn: 'SaddleBrown', descriptionKey: 'SaddleBrown', hex: '#8B4513', rgb: 'rgb(139, 69, 19)' },
  { name: '黄褐色', nameEn: 'Tan', descriptionKey: 'Tan', hex: '#D2B48C', rgb: 'rgb(210, 180, 140)' },
  { name: '红木色', nameEn: 'Sienna', descriptionKey: 'Sienna', hex: '#A0522D', rgb: 'rgb(160, 82, 45)' },
  { name: '原木色', nameEn: 'Burlywood', descriptionKey: 'Burlywood', hex: '#DEB887', rgb: 'rgb(222, 184, 135)' },
  { name: '巧克力色', nameEn: 'Chocolate', descriptionKey: 'Chocolate', hex: '#D2691E', rgb: 'rgb(210, 105, 30)' },
  { name: '秘鲁色', nameEn: 'Peru', descriptionKey: 'Peru', hex: '#CD853F', rgb: 'rgb(205, 133, 63)' },
  { name: '赭色', nameEn: 'Ochre', descriptionKey: 'Ochre', hex: '#CC7722', rgb: 'rgb(204, 119, 34)' },
  { name: '卡其色', nameEn: 'Khaki', descriptionKey: 'Khaki', hex: '#F0E68C', rgb: 'rgb(240, 230, 140)' },
  { name: '深卡其', nameEn: 'DarkKhaki', descriptionKey: 'DarkKhaki', hex: '#BDB76B', rgb: 'rgb(189, 183, 107)' },
  { name: '小麦色', nameEn: 'Wheat', descriptionKey: 'Wheat', hex: '#F5DEB3', rgb: 'rgb(245, 222, 179)' },
  { name: '褐玫瑰', nameEn: 'RosyBrown', descriptionKey: 'RosyBrown2', hex: '#BC8F8F', rgb: 'rgb(188, 143, 143)' },
  { name: '沙棕', nameEn: 'SandyBrown', descriptionKey: 'SandyBrown', hex: '#F4A460', rgb: 'rgb(244, 164, 96)' },

  // 土耳其玉色系
  { name: '土耳其玉', nameEn: 'Turquoise', descriptionKey: 'Turquoise', hex: '#40E0D0', rgb: 'rgb(64, 224, 208)' },
  {
    name: '浅土耳其玉',
    nameEn: 'LightTurquoise',
    descriptionKey: 'LightTurquoise',
    hex: '#40E0D0',
    rgb: 'rgb(64, 224, 208)'
  },
  {
    name: '中土耳其玉',
    nameEn: 'MediumTurquoise',
    descriptionKey: 'MediumTurquoise',
    hex: '#48D1CC',
    rgb: 'rgb(72, 209, 204)'
  },
  {
    name: '深土耳其玉',
    nameEn: 'DarkTurquoise',
    descriptionKey: 'DarkTurquoise',
    hex: '#00CED1',
    rgb: 'rgb(0, 206, 209)'
  }
]

const columns: ColumnDef<ColorReference>[] = [
  {
    id: 'color',
    header: () => t('views.dev.color.table.color'),
    cell: ({ row }) => {
      return h('div', {
        class: 'w-8 h-8 rounded border',
        style: { backgroundColor: row.original.hex }
      })
    },
    size: 80
  },
  {
    accessorKey: 'name',
    header: () => t('views.dev.color.table.name')
  },
  {
    accessorKey: 'nameEn',
    header: () => t('views.dev.color.table.nameEn')
  },
  {
    id: 'description',
    header: () => t('views.dev.color.table.description'),
    cell: ({ row }) => {
      return h('span', {}, t(`views.dev.color.desc.${row.original.descriptionKey}`))
    }
  },
  {
    accessorKey: 'hex',
    header: () => t('views.dev.color.table.hex'),
    cell: ({ row }) => {
      return h('span', { class: 'font-mono' }, row.original.hex)
    }
  },
  {
    accessorKey: 'rgb',
    header: () => t('views.dev.color.table.rgb'),
    cell: ({ row }) => {
      return h('span', { class: 'font-mono' }, row.original.rgb)
    }
  }
]
</script>

<template>
  <div class="space-y-8">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.dev.color.title') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('views.dev.color.description') }}</p>
    </div>

    <!-- 颜色选择器 -->
    <div class="space-y-4">
      <h2 class="text-lg font-medium">{{ t('views.dev.color.picker') }}</h2>
      <div class="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
        <!-- 左侧：当前颜色信息 -->
        <div class="flex flex-col gap-6 p-6 rounded-lg border bg-transparent w-full lg:w-auto lg:min-w-[320px]">
          <div
            class="h-40 w-40 sm:h-48 sm:w-48 mx-auto rounded-lg border shadow-sm"
            :style="{ backgroundColor: pickerHex }"
          />
          <div class="grid gap-3">
            <div class="flex items-center gap-3 py-1">
              <span class="text-sm font-medium w-14">HEX:</span>
              <span class="font-mono flex-1 text-sm">{{ pickerHex }}</span>
              <Button variant="outline" size="sm" @click="copyColor(pickerHex)">
                {{ t('views.dev.color.copy') }}
              </Button>
            </div>
            <div class="flex items-center gap-3 py-1">
              <span class="text-sm font-medium w-14">RGB:</span>
              <span class="font-mono flex-1 text-sm">rgb({{ pickerRgb.r }}, {{ pickerRgb.g }}, {{ pickerRgb.b }})</span>
              <Button
                variant="outline"
                size="sm"
                @click="copyColor(`rgb(${pickerRgb.r}, ${pickerRgb.g}, ${pickerRgb.b})`)"
              >
                {{ t('views.dev.color.copy') }}
              </Button>
            </div>
            <div class="flex items-center gap-3 py-1">
              <span class="text-sm font-medium w-14">RGBA:</span>
              <span class="font-mono flex-1 text-sm"
                >rgba({{ pickerRgb.r }}, {{ pickerRgb.g }}, {{ pickerRgb.b }}, {{ pickerRgb.a.toFixed(2) }})</span
              >
              <Button
                variant="outline"
                size="sm"
                @click="copyColor(`rgba(${pickerRgb.r}, ${pickerRgb.g}, ${pickerRgb.b}, ${pickerRgb.a.toFixed(2)})`)"
              >
                {{ t('views.dev.color.copy') }}
              </Button>
            </div>
            <div class="flex items-center gap-3 py-1">
              <span class="text-sm font-medium w-14">HSL:</span>
              <span class="font-mono flex-1 text-sm"
                >hsl({{ pickerHsl.h }}, {{ pickerHsl.s }}%, {{ pickerHsl.l }}%)</span
              >
              <Button
                variant="outline"
                size="sm"
                @click="copyColor(`hsl(${pickerHsl.h}, ${pickerHsl.s}%, ${pickerHsl.l}%)`)"
              >
                {{ t('views.dev.color.copy') }}
              </Button>
            </div>
            <div class="flex items-center gap-3 py-1">
              <span class="text-sm font-medium w-14">HSLA:</span>
              <span class="font-mono flex-1 text-sm"
                >hsla({{ pickerHsl.h }}, {{ pickerHsl.s }}%, {{ pickerHsl.l }}%, {{ pickerHsl.a.toFixed(2) }})</span
              >
              <Button
                variant="outline"
                size="sm"
                @click="copyColor(`hsla(${pickerHsl.h}, ${pickerHsl.s}%, ${pickerHsl.l}%, ${pickerHsl.a.toFixed(2)})`)"
              >
                {{ t('views.dev.color.copy') }}
              </Button>
            </div>
          </div>
        </div>

        <!-- 右侧：vue-color 选择器 -->
        <div class="flex-1 flex flex-col gap-8 justify-center lg:justify-start">
          <SketchPicker v-model="pickerColor" class="w-full max-w-[320px]" />
          <RGBSliders v-model="pickerColor" class="w-full max-w-[320px]" />
        </div>
      </div>
    </div>

    <!-- 颜色码对照表 -->
    <div class="space-y-4">
      <h2 class="text-lg font-medium">{{ t('views.dev.color.reference') }}</h2>
      <DataTable
        :columns="columns"
        :data="colorReferences"
        :page-size="200"
        :show-pagination="false"
        :show-reload="false"
      />
    </div>
  </div>
</template>
