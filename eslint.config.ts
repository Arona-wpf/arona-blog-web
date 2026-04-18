import pluginVitest from '@vitest/eslint-plugin'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import { globalIgnores } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import eslintPluginPrettier from 'eslint-plugin-prettier'
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort'
import pluginVue from 'eslint-plugin-vue'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}']
  },

  globalIgnores(['**/dist/**', '**/gulpfile.cjs', '**/server.cjs']),

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*']
  },
  skipFormatting,

  {
    plugins: {
      'simple-import-sort': pluginSimpleImportSort
    },
    rules: {
      // eslint-plugin-import 的 import/order 在 ESLint 10 下会崩溃；用 simple-import-sort 做 import 排序
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      // 关闭any检测
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-any': 'off',

      // 不使用分号
      semi: ['error', 'never'],

      // 单引号
      quotes: ['error', 'single'],

      // 缩进规则
      indent: [
        'error',
        2,
        {
          SwitchCase: 1
        }
      ],

      // 与 Prettier trailingComma: none 一致，禁止尾随逗号
      'comma-dangle': ['error', 'never'],

      // 最大空行
      'no-multiple-empty-lines': [
        'error',
        {
          max: 1,
          maxEOF: 1
        }
      ],

      // 不能有多余的空格
      'no-multi-spaces': 'error',

      // 逗号空格
      'comma-spacing': [
        'error',
        {
          before: false,
          after: true
        }
      ],

      // 注释空格
      'spaced-comment': ['error', 'always'],

      // 关键字空格
      'keyword-spacing': [
        'error',
        {
          after: true
        }
      ],

      // 箭头函数空格
      'arrow-spacing': 'error',

      // 禁用尾空格
      'no-trailing-spaces': 'error',

      // 中缀操作符空格
      'space-infix-ops': [
        'error',
        {
          int32Hint: false
        }
      ],

      // 一元运算符的前/后加空格
      'space-unary-ops': [
        'error',
        {
          words: true,
          nonwords: false
        }
      ],

      // 禁止多余括号
      'no-extra-parens': 'error',

      // 数组空格
      'array-bracket-spacing': ['error', 'always'],

      // 对象字面量空格
      'object-curly-spacing': ['error', 'always'],

      // 对象冒号空格
      'key-spacing': [
        'error',
        {
          beforeColon: false,
          afterColon: true
        }
      ],

      // 完全相等
      eqeqeq: ['error', 'always'],

      // 不能有声明后未被使用的变量或参数
      'no-unused-vars': [
        'off',
        {
          vars: 'all',
          args: 'after-used'
        }
      ],

      // 禁用var
      'no-var': 'error',

      // 首选const
      'prefer-const': 'warn',

      // const不可修改
      'no-const-assign': 'error',

      // 禁止无效的正则表达式
      'no-invalid-regexp': 'error',

      // parseint必须指定进制
      radix: 'error',

      // case不可重复
      'no-duplicate-case': 'error',

      // import不可重复
      'no-duplicate-imports': 'error',

      // if包含return，不允许使用else
      'no-else-return': 'error',

      // 正则不允许匹配空字符[]
      'no-empty-character-class': 'error',

      // 不允许空解构
      'no-empty-pattern': 'error',

      // 对象禁止重复key
      'no-dupe-keys': 'error',

      // 驼峰
      camelcase: 'off',

      // 不允许promise中使用 await
      'consistent-return': 'off',

      // return 后面是否允许省略
      'no-async-promise-executor': 'off',

      // eval不可用
      'no-eval': 'error',

      // 圈复杂度
      complexity: ['error', 50],

      // 关闭组件命名大写检测
      'vue/multi-word-component-names': 'off',

      // 文件最后必须回车结尾，且只能有一个换行符
      'eol-last': ['error', 'always'],

      // 行宽：由末尾 `prettier/prettier` 在 --fix 时换行；此处仅作兜底（与 printWidth 一致）
      'max-len': [
        'error',
        {
          code: 120,
          tabWidth: 2,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
          ignoreComments: false
        }
      ]
    }
  },

  // 关闭与 Prettier 冲突的 stylistic 规则，并启用 prettier/prettier，使 eslint --fix 能自动折行（含 .vue 模板）
  eslintConfigPrettier,
  {
    plugins: {
      prettier: eslintPluginPrettier
    },
    rules: {
      'prettier/prettier': [
        'error',
        {},
        {
          usePrettierrc: true
        }
      ]
    }
  },

  // 必须放在 prettier 之后：env.d.ts 以 .ts 结尾会命中 `**/*.ts`，需关闭会破坏 `/// <reference />` 的规则
  {
    name: 'env.d.ts',
    files: ['env.d.ts'],
    rules: {
      'spaced-comment': 'off',
      'prettier/prettier': 'off'
    }
  }
)
