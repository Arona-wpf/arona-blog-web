/**
 * 根据包名生成国际化键
 * 例如: @vueuse/core -> vueuseCore
 *       axios -> axios
 */
export function generateDependencyI18nKey(packageName: string): string {
  const keyName = packageName
    .replace(/^@/, '')
    .replace(/[-/]/g, '_')
    .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
  return `views.about.techStack.${keyName}`
}

/**
 * 常见依赖的中文描述
 */
export const dependencyDescriptions: Record<string, string> = {
  // 前端依赖
  axios: 'HTTP客户端',
  'crypto-js': '加密算法库',
  'lucide-vue-next': '图标库',
  pinia: '状态管理',
  'reka-ui': '无样式组件库',
  tailwindcss: '原子化CSS框架',
  typescript: '类型安全',
  'vee-validate': '表单验证',
  vue: '渐进式JavaScript框架',
  'vue-color': '颜色选择器组件',
  'vue-i18n': '国际化',
  'vue-router': '官方路由管理器',
  vite: '构建工具',
  zod: 'Schema验证',
  dayjs: '日期处理库',
  echarts: '图表库',
  koa: 'Node.js Web框架',
  'koa-send': '静态文件发送',
  'koa-static': '静态文件服务',
  'lodash-es': '实用工具库',
  nanoid: '唯一ID生成器',
  nprogress: '进度条',
  'sm-crypto': '国密算法库',
  'tailwind-merge': 'Tailwind类名合并',
  'class-variance-authority': '类变体管理',
  clsx: '类名拼接工具',
  '@tanstack/vue-table': '表格组件',
  '@vueuse/core': 'Vue组合式工具集',
  '@wangeditor-next/editor': '富文本编辑器',
  '@wangeditor-next/editor-for-vue': 'Vue富文本编辑器',
  archiver: '文件压缩',

  // 前端开发依赖
  '@tailwindcss/vite': 'Tailwind Vite插件',
  '@tsconfig/node24': 'Node 24 TypeScript配置',
  '@types/archiver': 'Archiver类型定义',
  '@types/crypto-js': 'CryptoJS类型定义',
  '@types/koa': 'Koa类型定义',
  '@types/lodash-es': 'Lodash-es类型定义',
  '@types/node': 'Node.js类型定义',
  '@types/nprogress': 'NProgress类型定义',
  '@types/sm-crypto': 'SM-Crypto类型定义',
  '@vitejs/plugin-vue': 'Vite Vue插件',
  '@vitest/eslint-plugin': 'Vitest ESLint插件',
  '@vue/eslint-config-prettier': 'Vue Prettier配置',
  '@vue/eslint-config-typescript': 'Vue TypeScript配置',
  '@vue/tsconfig': 'Vue TypeScript配置',
  del: '文件删除工具',
  eslint: '代码检查工具',
  'eslint-config-prettier': 'ESLint Prettier配置',
  'eslint-plugin-import': 'ESLint Import插件',
  'eslint-plugin-prettier': 'ESLint Prettier插件',
  'eslint-plugin-simple-import-sort': '导入排序插件',
  'eslint-plugin-vue': 'Vue ESLint插件',
  gulp: '任务运行器',
  'gulp-shell': 'Gulp Shell插件',
  jiti: 'TypeScript运行时',
  'npm-run-all2': '并行运行脚本',
  prettier: '代码格式化工具',
  'rollup-plugin-visualizer': '打包分析工具',
  terser: 'JavaScript压缩工具',
  'tw-animate-css': 'Tailwind动画CSS',
  'vite-plugin-bundle-obfuscator': '代码混淆插件',
  'vite-plugin-vue-devtools': 'Vue开发工具',
  'vue-tsc': 'Vue TypeScript编译器',

  // 后端依赖
  '@aws-sdk/client-s3': 'AWS S3客户端',
  '@aws-sdk/s3-request-presigner': 'AWS S3预签名URL',
  '@midwayjs/axios': 'Midway Axios组件',
  '@midwayjs/bootstrap': 'Midway启动器',
  '@midwayjs/bullmq': 'Midway BullMQ组件',
  '@midwayjs/cache-manager': 'Midway缓存管理',
  '@midwayjs/captcha': 'Midway验证码组件',
  '@midwayjs/core': 'Midway核心',
  '@midwayjs/i18n': 'Midway国际化组件',
  '@midwayjs/info': 'Midway信息组件',
  '@midwayjs/koa': 'Midway Koa组件',
  '@midwayjs/logger': 'Midway日志组件',
  '@midwayjs/redis': 'Midway Redis组件',
  '@midwayjs/sequelize': 'Midway Sequelize组件',
  '@midwayjs/session': 'Midway会话组件',
  '@midwayjs/typegoose': 'Midway Typegoose组件',
  '@midwayjs/upload': 'Midway上传组件',
  '@midwayjs/validate': 'Midway验证组件',
  '@midwayjs/ws': 'Midway WebSocket组件',
  '@typegoose/typegoose': 'Typegoose ODM',
  chokidar: '文件监听库',
  'cos-nodejs-sdk-v5': '腾讯云COS SDK',
  exceljs: 'Excel处理库',
  'koa-redis': 'Koa Redis中间件',
  lodash: '实用工具库',
  mongoose: 'MongoDB ODM',
  nodemailer: '邮件发送库',
  'qcloud-cos-sts': '腾讯云STS',

  // 后端开发依赖
  '@midwayjs/mock': 'Midway Mock组件',
  '@types/jest': 'Jest类型定义',
  '@types/koa-redis': 'Koa-Redis类型定义',
  '@types/lodash': 'Lodash类型定义',
  '@types/nodemailer': 'Nodemailer类型定义',
  'cross-env': '跨平台环境变量',
  jest: 'JavaScript测试框架',
  'ts-jest': 'Jest TypeScript预处理器',
  mwts: 'Midway TypeScript标准',
  mwtsc: 'Midway TypeScript编译器'
}
