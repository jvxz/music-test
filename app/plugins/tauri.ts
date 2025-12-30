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

    const settings = useState<Settings>('settings')
    const settingsFromPrefs = prefs.get('settings') as Settings | undefined
    settings.value = settingsFromPrefs ?? DEFAULT_SETTINGS

    watchDebounced(settings, () => tauriStore.set('settings', settings.value), { debounce: 500 })

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
