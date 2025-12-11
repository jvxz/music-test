import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  app: {
    head: {
      charset: 'utf-8',
      meta: [
        { content: 'no', name: 'format-detection' },
      ],
      title: 'swim',
      viewport: 'width=device-width, initial-scale=1',
    },
    layoutTransition: {
      mode: 'out-in',
      name: 'layout',
    },
    pageTransition: {
      mode: 'out-in',
      name: 'page',
    },
  },
  colorMode: {
    storage: 'cookie',
  },
  compatibilityDate: '2025-12-02',
  css: [
    '@/assets/css/globals.css',
  ],
  devServer: {
    host: '0.0.0.0',
  },
  devtools: {
    enabled: false,
  },
  dir: {
    modules: 'app/modules',
  },
  eslint: {
    config: {
      standalone: false,
    },
  },
  experimental: {
    typedPages: true,
  },
  fonts: {
    defaults: {
      preload: true,
      weights: [400, 500, 700],
    },
  },
  imports: {
    presets: [
      {
        from: 'zod',
        imports: [
          'z',
          {
            as: 'zInfer',
            name: 'infer',
            type: true,
          },
        ],
      },
    ],
  },
  modules: [
    '@vueuse/nuxt',
    'reka-ui/nuxt',
    '@nuxt/eslint',
    '@nuxtjs/color-mode',
    '@nuxt/icon',
    '@nuxt/fonts',
    '@nuxt/image',
  ],
  router: {
    options: {
      scrollBehaviorType: 'smooth',
    },
  },
  ssr: false,
  svgo: {
    autoImportPath: '@/assets/',
  },
  vite: {
    clearScreen: false,
    envPrefix: ['VITE_', 'TAURI_'],
    plugins: [tailwindcss()],
    server: {
      hmr: {
        host: '0.0.0.0',
        port: 3001,
        protocol: 'ws',
      },
      strictPort: true,
      watch: {
        ignored: ['**/src-tauri/**'],
      },
    },
  },
})
