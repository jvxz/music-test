export default defineNuxtConfig({
  app: {
    head: {
      charset: 'utf-8',
      meta: [
        { content: 'no', name: 'format-detection' },
      ],
      title: 'Nuxtor',
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
  compatibilityDate: '2025-09-01',
  css: [
    '@/assets/css/main.css',
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
    '@nuxt/ui',
    'nuxt-svgo',
    'reka-ui/nuxt',
    '@nuxt/eslint',
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
