import type { StatOptions } from '@tauri-apps/plugin-fs'
import { stat } from '@tauri-apps/plugin-fs'

export const isFile = createUnrefFn(async (path: string, opts?: StatOptions) => {
  const { isFile } = await stat(path, opts)
  return isFile
})

export const isDir = createUnrefFn(async (path: string, opts?: StatOptions) => {
  const { isDirectory } = await stat(path, opts)
  return isDirectory
})
