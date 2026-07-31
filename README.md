# arona-blog-web

中文 | [English](./README.en.md)

Aronaの小屋 网站的前端 Web 服务。综合性开发者工具集，涵盖加密工具、时间工具、文本处理以及米哈游游戏抽卡记录分析。

## 功能特性

### 开发者工具 (`/develop`)

| 工具               | 说明                                                     |
| ------------------ | -------------------------------------------------------- |
| **密码生成器**     | 生成安全随机密码，支持自定义长度和字符集                 |
| **NanoID 生成器**  | 使用 NanoID 算法生成唯一 ID                              |
| **JSON 格式化**    | 格式化、校验和美化的 JSON 数据工具                       |
| **字节计算器**     | 在字节、KB、MB、GB、TB 之间转换                          |
| **罗马数字转换器** | 阿拉伯数字与罗马数字互转                                 |
| **颜色选择器**     | 颜色转换（HEX、RGB、HSL）与可视化取色器                  |
| **进制转换器**     | 不同进制间的数值转换（二进制、八进制、十进制、十六进制） |

### 加密工具 (`/crypto`)

| 工具           | 说明                                |
| -------------- | ----------------------------------- |
| **MD5 哈希**   | 生成文本的 MD5 哈希值               |
| **SHA 哈希**   | 生成 SHA-1、SHA-256、SHA-512 哈希值 |
| **Base64**     | Base64 编解码                       |
| **JWT 解码器** | 解码和检查 JWT 令牌                 |
| **RSA**        | RSA 加解密，支持密钥对生成          |
| **RC4**        | RC4 流密码加解密                    |
| **SM2**        | 国密 SM2 非对称加密                 |
| **SM4**        | 国密 SM4 对称加密                   |
| **AES**        | AES 对称加密，支持多种密钥长度      |
| **DES**        | DES 对称加密（兼容遗留系统）        |

### 时间工具 (`/time`)

| 工具             | 说明                          |
| ---------------- | ----------------------------- |
| **时间戳转换器** | Unix 时间戳与日期时间格式互转 |
| **日期计算器**   | 计算日期差值，加减天数        |
| **世界时钟**     | 同时显示多个时区的时钟        |

### 文本工具 (`/text`)

| 工具               | 说明               |
| ------------------ | ------------------ |
| **URL 编解码**     | URL 组件编码/解码  |
| **Unicode 转换器** | Unicode 与文本互转 |
| **十六进制字符串** | 十六进制与文本互转 |

### 抽卡记录分析 (`/gacha`)

三款米哈游游戏的综合抽卡记录查看器与分析工具：

| 游戏               | 说明                                   |
| ------------------ | -------------------------------------- |
| **原神**           | 查看所有卡池统计、保底计数、物品时间线 |
| **崩坏：星穹铁道** | 跃迁历史记录，卡池明细与 5★ 统计       |
| **绝区零**         | 调频信号与邦布契约分析                 |

主要功能：

- 通过游戏 API URL（authkey）导入
- 按卡池筛选和搜索
- 保底计数器（保底进度展示）
- 导出为 Excel/JSON/CSV
- 可视化物品时间线（带图标）
- WebSocket 实时同步进度

### 用户系统 (`/user`)

- **登录/注册** — 邮箱注册，验证码校验
- **密码找回** — 通过邮件多步骤重置密码
- **资料管理** — 更新昵称、生日、性别
- **修改密码** — 验证后修改密码

### 管理功能

- **日志查看器** (`/log`) — WebSocket 实时日志流（仅管理员）
- **系统配置** (`/system/config`) — 运行时配置管理（仅管理员）

## 项目架构

| 组成      | 版本                 |
| --------- | -------------------- |
| 框架      | Vue 3                |
| 语言      | TypeScript 5.9.3     |
| 打包工具  | Vite 8               |
| 状态管理  | Pinia                |
| 路由      | Vue Router 5         |
| 国际化    | Vue I18n             |
| 样式      | Tailwind CSS 4       |
| UI 组件库 | shadcn-vue (reka-ui) |

## 开发命令

```sh
# 安装依赖
yarn install

# 开发模式（热重载）
yarn dev

# 类型检查
yarn type-check

# 代码规范检查
yarn lint
yarn lint:oxlint

# 代码格式化
yarn format

# 生产构建
yarn build

# 构建预览
yarn preview

# 启动生产服务器
yarn start
```

**Node.js 要求：** >= 24.0.0（Volta 锁定 24.18.0）

## 架构设计

### 目录结构（src/）

```
main.ts                   — 应用入口，创建 Vue 实例并挂载插件
App.vue                   — 根组件
style.css                 — 全局样式（Tailwind 入口）
assets/                   — 静态资源（图片等）
components/ui/            — UI 组件库（shadcn-vue 风格，基于 reka-ui）
  button.vue              — 按钮变体（primary、secondary、outline、ghost、destructive）
  input.vue               — 文本输入，支持校验
  textarea.vue            — 多行文本输入
  form/                   — 表单组件，集成 vee-validate
  dialog.vue              — 模态对话框
  drawer.vue              — 侧边抽屉（移动端友好）
  sheet.vue               — 侧边面板
  sidebar.vue             — 可折叠侧边导航
  dropdown-menu.vue       — 下拉菜单
  avatar.vue              — 用户头像，支持回退
  select.vue              — 下拉选择
  combobox.vue            — 带搜索的组合框
  checkbox.vue            — 复选框
  switch.vue              — 开关切换
  radio-group.vue         — 单选组
  tabs.vue                — 标签页导航
  table.vue               — 静态表格
  data-table.vue          — 动态表格，支持排序、筛选、分页
  pagination.vue          — 分页控件
  calendar.vue            — 日历选择器
  date-picker.vue         — 日期选择器（弹出层）
  upload.vue              — 文件上传，支持拖拽
  tooltip.vue             — 工具提示
  skeleton.vue            — 加载骨架屏
  separator.vue           — 水平/垂直分隔线
  scroll-area.vue         — 可滚动容器，自定义滚动条样式
  empty.vue               — 空状态占位
  sonner.vue              — Toast 通知（vue-sonner 封装）
components/layout/        — 布局组件
  AppLayout.vue           — 主布局：Header + Sidebar + RouterView
  SectionOutlet.vue       — 嵌套路由出口，用于分区页面
  Header.vue              — 顶部栏，含导航、用户菜单、语言切换
  Footer.vue              — 页脚
components/common/        — 通用共享组件
views/                    — 页面视图，按功能模块分目录
  develop/                — 开发者工具（password、nanoid、json、byte、roman、color、radix）
  crypto/                 — 加密工具（md5、sha、base64、jwt、rsa、rc4、sm2、sm4、aes、des）
  time/                   — 时间工具（timestamp、calculator、world clock）
  text/                   — 文本工具（url、unicode、hex）
  gacha/                  — 抽卡记录查看器（genshin、starrail、zzz）
    components/           — 抽卡专用组件（卡池选择器、记录表格、导出对话框）
    dialog/               — 抽卡对话框（导入 URL、同步进度、导出格式）
  user/                   — 用户系统
    login/                — 登录页（含验证码）
    register/             — 注册页
    reset/                — 密码重置流程（多步表单）
    profile/              — 用户资料管理
    password/             — 修改密码
  log/                    — 管理员日志查看器
  system/                 — 管理员系统配置
  about/                  — 关于页面
  error/                  — 错误页面（404）
plugins/                  — Vue 插件注册
  router.ts               — Vue Router 配置，含路由守卫
  store.ts                — Pinia 状态管理初始化
  i18n.ts                 — Vue I18n 配置
stores/                   — Pinia 状态管理
  user.ts                 — 用户登录状态、userInfo、roles
composables/              — Vue 组合式函数
  useAppColorMode.ts      — 暗色/亮色模式切换，localStorage 持久化
  useDocumentTitleI18n.ts — 根据 i18n key 设置文档标题
  useCaptchaSendCooldown.ts — 验证码发送冷却计时器
lib/                      — 工具函数与库封装
  request.ts              — Axios 封装，含缓存、去重、错误处理
  nprogress.ts            — NProgress 加载条封装
  utils.ts                — 通用工具函数
  websocket.ts            — WebSocket 客户端，用于实时通信
fetch/                    — API 请求封装（Get、Post、Put、Delete）
  index.ts                — 基础请求辅助函数
  captcha/                — 验证码 API
  file/                   — 文件上传 API
  gacha/                  — 抽卡同步、导出、配置 API
  log/                    — 日志文件 API
  login/                  — 登录 API
  logout/                 — 登出 API
  register/               — 注册 API
  user/                   — 用户资料、密码 API
  system/                 — 系统配置 API
definitions/              — 常量、枚举、类型定义
  constants/              — 运行时常量
  enums/                  — 枚举定义（ResponseCodeEnum、GameTypeEnum）
  types/                  — TypeScript 类型定义
locale/                   — 国际化词条（zh_cn/、en_us/）
  global.json             — 全局翻译（常用词、错误、成功消息）
  layout.json             — 布局翻译（导航项、头部）
  views.*.json            — 页面级翻译（如 views.crypto.json）
types/                    — 全局类型声明（vue-router.d.ts）
```

### 路由结构

使用 `createWebHistory` 模式，支持嵌套路由分区：

| 路由                | 说明               | Meta                                         |
| ------------------- | ------------------ | -------------------------------------------- |
| `/develop`          | 开发者工具总览     | 侧边导航                                     |
| `/develop/password` | 密码生成器         | `titleKey`                                   |
| `/develop/nanoid`   | NanoID 生成器      | `titleKey`                                   |
| `/develop/json`     | JSON 格式化        | `titleKey`                                   |
| `/develop/byte`     | 字节计算器         | `titleKey`                                   |
| `/develop/roman`    | 罗马数字转换器     | `titleKey`                                   |
| `/develop/color`    | 颜色选择器         | `titleKey`                                   |
| `/develop/radix`    | 进制转换器         | `titleKey`                                   |
| `/crypto`           | 加密工具总览       | 侧边导航                                     |
| `/crypto/md5`       | MD5 哈希           | `titleKey`                                   |
| `/crypto/sha`       | SHA 哈希           | `titleKey`                                   |
| `/crypto/base64`    | Base64             | `titleKey`                                   |
| `/crypto/jwt`       | JWT 解码器         | `titleKey`                                   |
| `/crypto/rsa`       | RSA                | `titleKey`                                   |
| `/crypto/rc4`       | RC4                | `titleKey`                                   |
| `/crypto/sm2`       | SM2                | `titleKey`                                   |
| `/crypto/sm4`       | SM4                | `titleKey`                                   |
| `/crypto/aes`       | AES                | `titleKey`                                   |
| `/crypto/des`       | DES                | `titleKey`                                   |
| `/time`             | 时间工具总览       | 侧边导航                                     |
| `/time/timestamp`   | 时间戳转换器       | `titleKey`                                   |
| `/time/calculator`  | 日期计算器         | `titleKey`                                   |
| `/time/world`       | 世界时钟           | `titleKey`                                   |
| `/text`             | 文本工具总览       | 侧边导航                                     |
| `/text/url`         | URL 编解码         | `titleKey`                                   |
| `/text/unicode`     | Unicode 转换器     | `titleKey`                                   |
| `/text/hex`         | 十六进制转换       | `titleKey`                                   |
| `/gacha`            | 抽卡总览           | `authOnly404`                                |
| `/gacha/genshin`    | 原神抽卡           | `authOnly404`, `titleKey`                    |
| `/gacha/starrail`   | 崩坏：星穹铁道抽卡 | `authOnly404`, `titleKey`                    |
| `/gacha/zzz`        | 绝区零抽卡         | `authOnly404`, `titleKey`                    |
| `/user/login`       | 登录页             | `guestOnly`, `hideSidebar`                   |
| `/user/register`    | 注册页             | `guestOnly`, `hideSidebar`                   |
| `/user/reset`       | 密码重置           | `guestOnly`, `hideSidebar`                   |
| `/user/profile`     | 用户资料           | `requireAuth`, `hideSidebar`                 |
| `/user/password`    | 修改密码           | `requireAuth`, `hideSidebar`                 |
| `/log`              | 日志查看器         | `requireAuth`, `requireAdmin`, `hideSidebar` |
| `/system/config`    | 系统配置           | `requireAuth`, `requireAdmin`, `hideSidebar` |
| `/about`            | 关于页面           | `hideSidebar`                                |
| `/:pathMatch(.*)*`  | 404 页面           | `hideSidebar`                                |

### 路由 Meta 字段

| 字段           | 类型    | 说明                                       |
| -------------- | ------- | ------------------------------------------ |
| `titleKey`     | string  | 页面标题的 i18n key                        |
| `sidebarNav`   | array   | 侧边导航配置 `[{ to, labelKey }]`          |
| `hideSidebar`  | boolean | 隐藏侧边栏（全宽页面）                     |
| `requireAuth`  | boolean | 需要登录，未登录跳转到 `/user/login`       |
| `guestOnly`    | boolean | 仅限游客，已登录用户跳转到 `/user/profile` |
| `authOnly404`  | boolean | 未登录用户返回 404                         |
| `requireAdmin` | boolean | 需要管理员角色，非管理员返回 404           |

### 请求封装

基于 `lib/request.ts` 的 Axios 封装：

- **请求缓存：** 使用 SM3 哈希作为缓存 key，避免重复请求
- **请求去重：** 防止短时间内对同一 URL 发起多次请求
- **响应拦截：** 自动处理 `redirect` 字段，显示错误 toast 提示
- **响应格式：** `{ code, msg, data, redirect }`，`code: 0` 表示成功
- **请求方法：** `Get`、`Post`、`Put`、`Delete`，从 `fetch/index.ts` 导出

### WebSocket 客户端

`lib/websocket.ts` 中的 `wsService`：

- 用户登录后自动连接（由路由守卫调用）
- 用户登出时断开
- 连接需要有效的会话 cookie（由后端鉴权）
- 事件路由：`module:action` 格式
  - `log:subscribe/unsubscribe/init/update` — 日志流推送
  - `gacha:sync-log` — 抽卡实时同步进度
  - `session:kicked` — 其他会话登录，踢出当前会话
- 心跳保活与自动重连（最多 5 次）
- 通过 `locale:update` 消息同步语言偏好

### 国际化

- 使用 `vue-i18n`，支持 `zh-CN` / `en-US`
- 词条按模块分文件：`global.json`、`layout.json`、`views.*.json`
- i18n key 使用点分层级（如 `layout.nav.modules.crypto`）
- 每个 key 必须同时存在中英文
- 存储 key：`arona-locale`（localStorage）
- 语言切换时通过 WebSocket 同步到服务端

### 状态管理

- 使用 Pinia Composition API 风格（`defineStore` + `ref`）
- `useUserStore` — 用户登录状态、用户信息管理
  - `isLoggedIn()` — 检查是否已登录
  - `setUserInfo(data)` — 设置用户信息（来自 API）
  - `clearUserInfo()` — 登出时清除

### UI 组件

基于 `reka-ui`（无样式 Vue 组件库）+ Tailwind CSS：

- **表单组件：** Button、Input、Textarea、Checkbox、Switch、RadioGroup、Select、Combobox
- **导航：** Sidebar、Tabs、Pagination
- **弹层：** Dialog、Drawer、Sheet、DropdownMenu、Tooltip、Popover
- **数据展示：** Table、DataTable、Avatar、Calendar、DatePicker
- **布局：** ScrollArea、Separator、Skeleton
- **反馈：** Sonner（Toast 通知）、Empty 空状态

组件遵循 shadcn-vue 风格，使用 Tailwind CSS 样式。

## 核心编码约定

### 文件命名

- Vue 组件：`PascalCase.vue`（如 `AppLayout.vue`）
- TypeScript 文件：`camelCase.ts`（如 `useAppColorMode.ts`）
- 常量文件：`*.constants.ts`
- 枚举文件：`*.enum.ts`
- 类型文件：`*.types.ts`

### 组件结构

- 使用 `<script setup lang="ts">` 语法
- 导入顺序：Node 内置 → 第三方 → `@/` 别名 → 相对路径
- Props 使用 `defineProps` + TypeScript 泛型
- 组件内逻辑优先使用 `composables` 复用

### 样式规范

- 使用 Tailwind CSS 4，支持 `@apply`、CSS 变量
- 颜色主题：`--background`、`--foreground`、`--primary`、`--muted` 等
- 暗色模式：通过 `useAppColorMode` 控制，CSS 变量自动切换

### 导入别名

- `@/` — `src/` 目录别名（由 vite/tsconfig 配置）

### 表单规范

- **表单命名**：`name` 属性使用 `lowercase_snake_case` 格式，如 `login_form`、`register_form`
- **多表单拆分**：当一个页面包含多个独立表单时，必须将每个表单拆分为独立的 `.vue` 文件
  - 拆分后的组件放在当前目录下的 `forms/` 子文件夹中
  - 子组件通过 `emit` 通知父组件进行下一步操作
  - 父组件管理步骤状态和跨步骤共享的数据

### 国际化 key 规范

- 必须使用 i18n key，禁止硬编码文案
- key 格式：`模块.子模块.字段`（如 `views.crypto.hash.title`）

### 枚举规范

- 使用 TypeScript `enum`，命名 `PascalCase` + `Enum` 后缀（如 `ResponseCodeEnum`）
- 枚举值使用 `UPPER_SNAKE_CASE`

## 代码风格

- 全部使用 TypeScript，2 空格缩进，LF 换行符，UTF-8 编码
- 命名：组件 `PascalCase`，方法/变量 `camelCase`，常量 `UPPER_SNAKE_CASE`
- 格式以 ESLint + Prettier 为准
- 导入排序：eslint-plugin-simple-import-sort
