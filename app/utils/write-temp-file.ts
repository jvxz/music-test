import type { XXHashAPI } from 'xxhash-wasm'
import { join, tempDir } from '@tauri-apps/api/path'
import { BaseDirectory, exists, writeFile } from '@tauri-apps/plugin-fs'
import xxhash from 'xxhash-wasm'

let h64Raw: XXHashAPI['h64Raw'] | null = null
let tempPath: string | null = null

async function getHasher() {
  if (!h64Raw) {
    h64Raw = (await xxhash()).h64Raw
  }
  return h64Raw
}

async function getTempPath() {
  if (!tempPath) {
    tempPath = await tempDir()
  }
  return tempPath
}

export async function writeTempFile(data: Uint8Array) {
  const hashFn = await getHasher()
  const hash = hashFn(data).toString(16)

  const doesExist = await exists(hash, { baseDir: BaseDirectory.Temp })

  if (!doesExist) {
    await writeFile(hash, data, { baseDir: BaseDirectory.Temp })
  }

  return join(await getTempPath(), hash)
}
