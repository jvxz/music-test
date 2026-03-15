import type { invoke } from '@tauri-apps/api/core'
import type { Browser } from 'webdriverio'

declare global {
  const browser: Browser
}

declare global {
  interface Window {
    __TAURI_INVOKE__: typeof invoke
  }
}

export {}
