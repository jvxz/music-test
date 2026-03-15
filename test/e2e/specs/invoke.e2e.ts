import type { FileEntry } from '../../../app/types/tauri-bindings'
import path from 'node:path'
import { expect } from '@wdio/globals'
import { $invoke } from '../utils/invoke'

describe('tauri invoke commands', () => {
  for (const test of [
    {
      artist: 'Artist',
      filename: 'title-artist.mp3',
      title: 'Title',
    },
  ]) {
    it(`successfully invokes get_track_data command & returns correct data for ${test.filename}`, async () => {
      const fixturePath = path.resolve(process.cwd(), 'test/fixtures', test.filename)
      const trackData = await $invoke<FileEntry>('get_track_data', [fixturePath, false])

      expect(trackData?.valid).toBe(true)
      expect(trackData?.tags.TIT2).toBe(test.title)
      expect(trackData?.tags.TPE1).toBe(test.artist)
    })
  }
})
