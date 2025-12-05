import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

export default defineNuxtPlugin(async () => {
  const rpc = createTauRPCProxy()

  const tauriPrefs = await useTauriStoreLoad('prefs.json', {
    autoSave: true,
    defaults: {
      'layout-panels': [12.5, 50, 12.5],
    },
  })

  // prerequisites (needed for fcp)
  const layoutPanels = await tauriPrefs.get<number[]>('layout-panels') ?? [12.5, 50, 12.5]

  return {
    provide: {
      tauri: {
        invoke,
        listen,
        rpc,
        store: {
          _loaded: {
            layoutPanels,
          },
          prefs: tauriPrefs,
        },
      },
    },
  }
})
