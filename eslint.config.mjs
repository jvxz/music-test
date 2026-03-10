import antfu from '@antfu/eslint-config'
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(antfu({
  formatters: true,
  ignores: [
    './src-tauri/**',
    './.output/**',
    './.nuxt/**',
    './app/types/tauri-bindings.ts',
    './app/types/db.ts',
    './.kysely-codegenrc.json',
    './app/utils/id3.ts',
  ],
  plugins: {
    'better-tailwindcss': eslintPluginBetterTailwindcss,
  },
  rules: {
    ...eslintPluginBetterTailwindcss.configs['recommended-warn'].rules,
    'antfu/curly': ['off'],
    'better-tailwindcss/enforce-consistent-line-wrapping': 'off',
    'curly': ['warn', 'multi-or-nest'],
    'no-console': 'warn',
    'node/prefer-global/buffer': 'off',
    'node/prefer-global/process': 'off',
    'perfectionist/sort-objects': 'warn',
    'vue/html-self-closing': 'off',
    'vue/max-attributes-per-line': ['warn', {
      multiline: {
        max: 1,
      },
      singleline: {
        max: 2,
      },
    }],
    'vue/no-multiple-template-root': 'off',
    'vue/sort-keys': 'warn',
  },
  settings: {
    'better-tailwindcss': {
      entryPoint: './app/assets/css/globals.css',
    },
  },
  typescript: true,
  vue: true,
}))
