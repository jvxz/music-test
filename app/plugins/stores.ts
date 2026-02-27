import type { Pinia } from 'pinia'
import { createPlugin } from '@tauri-store/pinia'

export default defineNuxtPlugin({
  name: 'stores',
  setup: async ({ $pinia }) => {
    ($pinia as Pinia).use(createPlugin())

    const stores = [useSettings, useConsole]
    for (const store of stores) {
      const instance = store()
      await instance.$tauri.start()
    }
  },
})
