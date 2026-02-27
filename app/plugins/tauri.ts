import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

export default defineNuxtPlugin({
  dependsOn: ['stores'],
  name: 'tauri',
  setup: async () => {
    const settings = useSettings()

    const store = await useTauriStoreLoad('prefs.json', {
      autoSave: true,
      defaults: {},
    })

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
