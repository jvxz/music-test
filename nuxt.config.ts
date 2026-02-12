import tailwindcss from '@tailwindcss/vite'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineNuxtConfig({
  $development: {
    app: {
      head: {
        script: [{ src: 'http://localhost:8098' }],
      },
    },
  },

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

  compatibilityDate: '2025-12-02',

  css: [
    '@/assets/css/globals.css',
  ],

  dayjs: {
    plugins: ['duration'],
  },

  devServer: {
    host: '0.0.0.0',
  },

  devtools: {
    timeline: {
      enabled: true,
    },
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

  ignore: [
    '**/src-tauri/**',
    '**/node_modules/**',
    '**/.output/**',
    '**/.nuxt/**',
    '**/.git/**',
  ],

  imports: {
    dirs: ['types', 'constants/**'],
    presets: [
      { package: 'scule' },
      {
        cache: true,
        from: 'defu',
        imports: [{
          as: '$defu',
          name: 'defu',
        }],
      },
      {
        cache: true,
        from: 'vue-draggable-plus',
        imports: [
          'useDraggablePlus',
        ],
      },
      {
        from: 'kysely',
        imports: [
          { name: 'Selectable', type: true },
        ],
      },
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
    '@nuxt/icon',
    'dayjs-nuxt',
    '@pinia/nuxt',
  ],

  router: {
    options: {
      scrollBehaviorType: 'smooth',
    },
  },

  routeRules: {
    '/playground': {
      appLayout: false,
    },
  },

  ssr: false,

  vite: {
    clearScreen: false,
    envPrefix: ['VITE_', 'TAURI_'],
    plugins: [tailwindcss(), vueDevTools()],
    server: {
      hmr: {
        host: '0.0.0.0',
        port: 3001,
        protocol: 'ws',
      },
      strictPort: true,
      watch: {
        ignored: [
          '**/src-tauri/**',
          '**/node_modules/**',
          '**/.output/**',
          '**/.nuxt/**',
          '**/.git/**',
        ],
      },
    },
  },
})
