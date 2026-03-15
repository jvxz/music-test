import type { invoke } from '@tauri-apps/api/core'
import type { FileEntry } from '../../../app/types/tauri-bindings'
import { expect } from '@wdio/globals'

declare global {
  interface Window {
    __TAURI_INVOKE__: typeof invoke
  }
}

describe('tauri invoke', () => {
  it('successfully invokes a tauri command', async () => {
    const trackData = await window.__TAURI_INVOKE__<FileEntry>('get_track_data', {
      pathString: '../fixtures/title-artist.mp3',
      refresh: false,
    })

    expect(trackData).toBeDefined()
  })
})
