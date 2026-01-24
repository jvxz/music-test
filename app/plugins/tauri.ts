import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { message } from '@tauri-apps/plugin-dialog'

export default defineNuxtPlugin({
  name: 'tauri',
  setup: async (app) => {
    const rpc = createTauRPCProxy()

    const tauriStore = await useTauriStoreLoad('prefs.json', {
      autoSave: true,
      defaults: {},
    })

    const entries = await tauriStore.entries()
    const prefs = new Map<string, unknown>(entries)

    const settings = useState<Settings>('settings')
    const settingsFromPrefs = prefs.get('settings') as Settings | undefined
    settings.value = {
      ...DEFAULT_SETTINGS,
      ...settingsFromPrefs,
    }

    watchDebounced(settings, () => tauriStore.set('settings', settings.value), {
      debounce: 500,
      // TODO: find better solution for deep watching
      deep: true,
    })

    errorHook.on((error) => {
      message(error.data, { kind: 'error', title: ERROR_TITLE_MAP[error.type] })
    })

    app.hook('vue:error', (err) => {
      if (err instanceof Error) {
        message(err.message, { kind: 'error', title: ERROR_TITLE_MAP.Other })
      }
      else {
        message(String(err), { kind: 'error', title: ERROR_TITLE_MAP.Other })
      }
    })

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
