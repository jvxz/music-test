import { exists as existsFn } from '@tauri-apps/plugin-fs'

export const exists = createUnrefFn(existsFn)
