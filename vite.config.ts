import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import viteBundleObfuscator from 'vite-plugin-bundle-obfuscator'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    viteBundleObfuscator({
      enable: true, // 是否启用代码混淆功能
      log: true, // 是否显示混淆处理日志
      autoExcludeNodeModules: true, // 自动排除node_modules目录
      threadPool: false, // 是否使用多线程处理（false可避免兼容性问题）

      options: {
        // === 压缩 ===
        compact: true,
        simplify: true,

        // === 核心混淆 ===
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.3,
        sourceMap: false,

        // === 死代码注入 ===
        deadCodeInjection: false,

        // === 自卫功能 ===
        selfDefending: true, // 开启自卫功能，防止代码被格式化工具还原

        // === 标识符 ===
        identifierNamesGenerator: 'hexadecimal',
        renameGlobals: false,

        // === 数字 / 字符串 ===
        numbersToExpressions: false,
        splitStrings: false,

        // === 推荐开启（安全提升明显）===
        stringArray: true,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 0.75,

        // === 保命配置 ===
        transformObjectKeys: false,
        unicodeEscapeSequence: false
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 12233,
    host: true,
    proxy: {
      '^/([^/]*-)?api/.*': {
        target: 'http://127.0.0.1:22333',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    target: ['es2022', 'edge89', 'firefox78', 'chrome89', 'safari15'],
    rollupOptions: {
      output: {
        // 动态导入的模块命名
        chunkFileNames: () => {
          return 'assets/js/[name]-[hash].js'
        },
        // 入口文件命名
        entryFileNames: 'assets/js/[name]-[hash].js',
        // 静态资源命名 - 使用现代 API
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names[0]
          if (/\.(css)$/.test(name)) {
            return 'assets/css/[name]-[hash].[ext]'
          }
          if (/\.(png|jpe?g|gif)$/.test(name)) {
            return 'assets/images/[name]-[hash].[ext]'
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(name)) {
            return 'assets/fonts/[name]-[hash].[ext]'
          }
          return 'assets/[name]-[hash].[ext]'
        }
      }
    },
    // 设置块大小警告限制为 1MB
    chunkSizeWarningLimit: 1024,
    // 启用源码映射（生产环境可选）
    sourcemap: false,
    // 压缩配置
    minify: 'terser'
  }
})
