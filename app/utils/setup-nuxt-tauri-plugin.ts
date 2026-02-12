import type { Plugin } from 'nuxt/app'
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'

export function setupNuxtTauriPlugin<T extends Record<string, unknown>>(allowedWindowLabels: string[] | string, plugin: Plugin<T> | undefined) {
  const currentWebview = getCurrentWebviewWindow()
  if (Array.isArray(allowedWindowLabels)) {
    if (!allowedWindowLabels.includes(currentWebview.label)) {
      return
    }
  }
  else {
    if (currentWebview.label !== allowedWindowLabels) {
      return
    }
  }

  return plugin ?? (() => {})
}
