import { invoke } from '@tauri-apps/api/core'

export default defineNuxtPlugin({
  parallel: true,
  setup: () => {
    if (!import.meta.test)
      return

    (window as any).__TAURI_INVOKE__ = invoke
  },
})
