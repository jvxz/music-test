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

    listen<string>('backend-error', ({ payload }) => {
      const colonIdx = payload.indexOf(':')
      const msg = colonIdx !== -1 ? payload.slice(colonIdx + 1).trim().slice(1, -1) : payload
      const title = objectValues(ERROR_TITLE_MAP).find(t => payload.slice(0, colonIdx !== -1 ? colonIdx : undefined)?.includes(t)) ?? ERROR_TITLE_MAP.Other

      message(msg, { kind: 'error', title })
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
