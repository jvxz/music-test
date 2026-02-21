import type { Pinia } from 'pinia'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { message } from '@tauri-apps/plugin-dialog'
import { createPlugin } from '@tauri-store/pinia'

export default defineNuxtPlugin({
  name: 'tauri',
  setup: async ({ $pinia, hook }) => {
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

    errorHook.on((error) => {
      message(error.data, { kind: 'error', title: ERROR_TITLE_MAP[error.type] })
    })

    hook('vue:error', (err) => {
      if (err instanceof Error) {
        message(err.message, { kind: 'error', title: ERROR_TITLE_MAP.Other })
      }
      else {
        message(String(err), { kind: 'error', title: ERROR_TITLE_MAP.Other })
      }
    })

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
