import type { Pinia } from 'pinia'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { createPlugin } from '@tauri-store/pinia'

export default defineNuxtPlugin({
  name: 'tauri',
  setup: async ({ $pinia }) => {
    ($pinia as Pinia).use(createPlugin())
    const settings = useSettings()

    const [, store] = await Promise.all([
      settings.$tauri.start(),
      useTauriStoreLoad('prefs.json', {
        autoSave: true,
        defaults: {},
      }),
    ])

    const entries = await store.entries()
    const prefs = new Map<string, unknown>(entries)

    return {
      provide: {
        settings,
        tauri: {
          invoke,
          listen,
          prefs,
          store,
        },
      },
    }
  },
})
