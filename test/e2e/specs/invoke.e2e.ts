import type { invoke } from '@tauri-apps/api/core'
import type { Browser } from 'webdriverio'
import type { FileEntry } from '../../../app/types/tauri-bindings'
import { browser, expect } from '@wdio/globals'

declare global {
  const browser: Browser
}

declare global {
  interface Window {
    __TAURI_INVOKE__: typeof invoke
  }
}

describe('tauri invoke', () => {
  it('successfully invokes a tauri command', async () => {
    await browser.waitUntil(
      async () => (await browser.execute(() => typeof window.__TAURI_INVOKE__ === 'function')) === true,
      { interval: 100, timeout: 10000 },
    )

    const trackData = await browser.execute(async () => window.__TAURI_INVOKE__<FileEntry>('get_track_data', {
      pathString: '../fixtures/title-artist.mp3',
      refresh: false,
    }))

    console.log('______TRACK DATA______: ', trackData)

    expect(trackData).toBeDefined()
  })
})
