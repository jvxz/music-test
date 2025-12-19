import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

export default defineNuxtPlugin({
  name: 'tauri',
  setup: async () => {
    const rpc = createTauRPCProxy()

    const tauriStore = await useTauriStoreLoad('prefs.json', {
      autoSave: true,
      defaults: {},
    })

    const entries = await tauriStore.entries()
    const prefs = new Map<string, unknown>(entries)

    return {
      provide: {
        tauri: {
          invoke,
          listen,
          prefs,
          rpc,
          store: tauriStore,
        },
      },
    }
  },
})
